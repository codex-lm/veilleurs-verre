#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent

def check_page(page, prefix, results):
    page.goto(f"{BASE_URL}?seed=browser-check", wait_until="networkidle")
    page.get_by_role("button", name="Begin an expedition", exact=True).click()
    assert "browser-check" in page.locator(".seed-chip").inner_text()
    page.locator(".route-node.available").first.click()
    assert page.locator(".cell").count() == 35
    assert page.locator(".card").count() == 5
    results["boardCells"] = 35
    results["initialHand"] = 5

    shatter = page.locator(".card", has_text="Shatter")
    shatter.click()
    page.locator(".cell[data-x='3'][data-y='2']").click()
    assert "Energy 3 → 1" in page.locator(".preview-text").inner_text()
    page.locator("button[data-action='cancel']").click()
    saved = json.loads(page.evaluate("localStorage.getItem('veilleurs-verre-expedition-v1')"))
    assert saved["combat"]["energy"] == 3
    assert len(saved["combat"]["crystals"]) == 1
    results["cancelBeforeConfirmation"] = "passed"

    shatter = page.locator(".card", has_text="Shatter")
    shatter.click()
    page.locator(".cell[data-x='3'][data-y='2']").click()
    page.locator("button[data-action='confirm']").click()
    saved_raw = page.evaluate("localStorage.getItem('veilleurs-verre-expedition-v1')")
    saved = json.loads(saved_raw)
    assert saved["combat"]["energy"] == 1
    assert len(saved["combat"]["crystals"]) == 0
    results["deterministicShatter"] = "3 → 1 energy; crystal removed"

    page.reload(wait_until="networkidle")
    page.get_by_role("button", name="Continue expedition", exact=True).click()
    restored_raw = page.evaluate("localStorage.getItem('veilleurs-verre-expedition-v1')")
    assert restored_raw == saved_raw
    assert page.locator(".card").count() == 4
    results["exactReload"] = {"status": "passed", "sha256": hashlib.sha256(saved_raw.encode()).hexdigest()}

    page.locator("button[data-action='end-turn']").click()
    saved = json.loads(page.evaluate("localStorage.getItem('veilleurs-verre-expedition-v1')"))
    assert saved["combat"]["turn"] == 2
    results["enemyTurn"] = "resolved; turn 2 reached"

    page.locator("button[data-lang='fr']").click()
    assert "Fin du tour" in page.locator("button[data-action='end-turn']").inner_text()
    page.locator("button[data-lang='es']").click()
    assert "Fin del turno" in page.locator("button[data-action='end-turn']").inner_text()
    page.locator("button[data-lang='en']").click()
    results["languages"] = ["EN", "FR", "ES"]

    page.screenshot(path=ROOT / "evidence" / f"{prefix}-desktop-combat.png", full_page=True)


def check_mobile(page, results):
    page.goto(f"{BASE_URL}?seed=browser-check", wait_until="networkidle")
    page.get_by_role("button", name="Begin an expedition", exact=True).tap()
    page.locator(".route-node.available").first.tap()
    assert page.locator(".cell").count() == 35
    page.locator(".intent-info").first.tap()
    assert page.locator(".modal").is_visible()
    assert "Pursuer" in page.locator(".modal-body").inner_text() or "Sentry" in page.locator(".modal-body").inner_text()
    page.locator(".modal-header button[data-action='close-modal']").tap()
    page.locator(".hero-row[data-id='guardian']").tap()
    legal = page.locator(".cell.legal")
    assert legal.count() > 0
    legal.first.tap()
    assert page.locator(".preview-panel").is_visible()
    page.locator("button[data-action='cancel']").tap()
    overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth")
    assert not overflow
    page.screenshot(path=ROOT / "evidence" / f"{args.prefix}-mobile-combat.png", full_page=True)
    results["touch"] = {"intentInfo": "passed", "movePreviewAndCancel": "passed", "horizontalOverflow": False}


with sync_playwright() as playwright:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:4175/")
    parser.add_argument("--prefix", default="local")
    args = parser.parse_args()
    BASE_URL = args.url.rstrip("/") + "/"
    browser = playwright.chromium.launch(headless=True)
    results = {"url": BASE_URL, "status": "running"}
    errors = []
    try:
        context = browser.new_context(viewport={"width": 1280, "height": 800}, locale="en-US")
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        check_page(page, args.prefix, results)
        context.close()
        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2, locale="en-US")
        page = mobile.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        check_mobile(page, results)
        mobile.close()
        assert not errors, errors
        results["pageErrors"] = []
        results["status"] = "passed"
    except Exception as error:
        results["status"] = "failed"
        results["error"] = str(error)
        results["pageErrors"] = errors
        raise
    finally:
        (ROOT / "evidence").mkdir(exist_ok=True)
        (ROOT / "evidence" / f"{args.prefix}-browser-check.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
        browser.close()
    print(json.dumps(results, indent=2))
