(() => {
  'use strict';

  const E = window.VeilleursEngine;
  const SAVE_KEY = 'veilleurs-verre-expedition-v1';
  const PREF_KEY = 'veilleurs-verre-preferences-v1';
  const params = new URLSearchParams(window.location.search);
  const requestedSeed = (params.get('seed') || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40);
  const app = document.getElementById('app');
  const modalRoot = document.getElementById('modal-root');
  const toastNode = document.getElementById('toast');
  const TEXT = {
    en: {
      selectedTarget: 'Selected target',
      title: 'The Glass Wardens', titleEm: 'of the last light', studio: 'Kimi Games · A LOB7 original',
      newExpedition: 'Begin an expedition', continue: 'Continue expedition', watch: 'Watch a guided expedition', how: 'How to play',
      homeEyebrow: 'A tactical card expedition', homeLead: 'Three small glass creatures. One darkened lighthouse. Read every enemy intent, shape the battlefield, and carry what remains of your team through five fateful steps.',
      localSave: 'Expedition saved on this device · English, Français, Español', featureIntent: 'Visible intents', featureIntentText: 'Enemy plans lock before you act.', featureCombo: 'Clever combinations', featureComboText: 'Push, shelter, swap and shatter.', featureWounds: 'Persistent wounds', featureWoundsText: 'Every reward is a meaningful choice.',
      mapTitle: 'The road to the lighthouse', mapLead: 'Choose one step. Your wounds and your deck travel with you.', stage: 'Step', finalStage: 'The lighthouse', deck: 'Your deck', collectionHelp: 'Upgrades strengthen every copy of a card. New cards join the next battle.', seed: 'Expedition seed', chooseNode: 'Choose a path',
      guardian: 'Guardian', scout: 'Scout', artificer: 'Artificer', guardianRole: 'Protects and pushes', scoutRole: 'Mobile · isolation bonus', artificerRole: 'Ranged · crystal control',
      combat: 'Encounter', rest: 'Rest', event: 'Event', final: 'Final battle', travel: 'Enter', completed: 'Completed', locked: 'Ahead',
      turn: 'Turn', energy: 'Energy', draw: 'Draw', discard: 'Discard', hand: 'Your hand', handHelp: 'Select a card, then a highlighted target', endTurn: 'End turn', endHint: 'Resolve shown intents', intents: 'Enemy intents', team: 'Your wardens', log: 'Field notes', noIntents: 'No enemies remain.',
      move: 'Move', moveAvailable: 'Free move', moved: 'Moved', downed: 'Shattered', guard: 'Guard', confirm: 'Confirm action', cancel: 'Cancel', previewMove: 'Movement preview', previewCard: 'Action preview', emptyHand: 'No cards in hand. You can still move or end the turn.', noTargets: 'No legal target for this card right now.', selectAction: 'Select a warden to move, or a card to act.',
      targetEnemy: 'Enemy', targetHero: 'Ally', targetSelf: 'Self · team', targetCell: 'Empty cell', targetCrystal: 'Crystal', targetTwo: 'Two allies', range: 'Range', anyRange: 'Team',
      rewardTitle: 'A moment in the light', rewardLead: 'Choose one reward. Healing matters only if you survive what comes next.', newCard: 'New card', upgradeCard: 'Upgrade card', healTeam: 'Mend the team', takeReward: 'Choose this reward',
      restTitle: 'The silent conservatory', restLead: 'A sheltered garden offers time for one careful choice.', restHeal: 'Rest among the ferns', restHealText: 'Restore 6 HP to every warden.', restUpgrade: 'Tune the glass', restUpgradeText: 'Upgrade every copy of {card}, but restore no HP.',
      eventTitle: 'The echoing archive', eventLead: 'Old light sleeps beneath careful hands. Something answers.', eventSalvage: 'Salvage the resonator', eventSalvageText: 'Each warden loses 1 HP. Add {card} to your deck.', eventHeal: 'Release the captive light', eventHealText: 'Restore 4 HP to every warden.',
      victoryTitle: 'The light remembers', victoryLead: 'The beacon turns above the ruined gardens. Three small silhouettes gleam in its path — changed by every choice that brought them here.', defeatTitle: 'The glass grows quiet', defeatLead: 'The lighthouse remains dark, but its echo is not gone. Try another route, another seed, or a different way of combining the same cards.',
      retrySeed: 'Retry this seed', newSeed: 'New expedition', backHome: 'Title screen', score: 'Score', turns: 'Combat turns', cardsPlayed: 'Cards played', crystals: 'Crystals shattered', route: 'Steps completed',
      helpTitle: 'How to guide the wardens', helpGoal: 'Cross five expedition steps, then relight the lighthouse. You win by defeating the final Warden. You lose if all three heroes shatter.', helpTurn: 'At the start of your turn, enemy intents are already locked. Each living hero may move up to two reachable cells once. Spend three shared energy on cards, then end the turn to resolve the announced enemy actions.', helpCards: 'Unused cards go to the discard. Draw back to five each turn; when the draw pile is empty, the discard is shuffled with the saved, reproducible random sequence. Wounds persist between battles. Fallen heroes return at 1 HP after a won encounter.', helpIntent: 'A cell attack hits that exact cell even if its original target moved. A move or charge follows its shown path and stops if blocked. Healing never switches to another target. Selecting an enemy or its ⓘ button explains its plan.', helpElements: 'Stone blocks movement and line of sight. Volatile crystals block cells until shattered. Glass thorns deal 2 damage on entry to either team. Guard absorbs damage during the coming enemy turn, then expires.', helpControls: 'Click or tap a hero or card to see legal actions. Choose a highlighted target to inspect the deterministic result. Confirm to commit, or cancel freely before confirmation. Escape cancels; Space ends the turn; M toggles sound.', helpBoss: 'The final Warden changes at half health: its announced row attacks become a row-and-column pattern dealing 3 damage. The current intent never changes during the transition.',
      intentAttack: 'Attack {cell} for {damage}', intentArea: 'Burst around {cell} for {damage}', intentMove: 'Move toward {cell}', intentHold: 'Hold position', intentCharge: 'Charge through {cell} · {damage} damage', intentHeal: 'Restore {amount} HP to {target}', intentRow: 'Beam across row {row} · {damage} damage', intentCross: 'Row and column through {cell} · {damage} damage',
      behaviorHound: 'Pursuer. Moves up to two cells toward the nearest warden; attacks an adjacent cell for 2.', behaviorSentry: 'Sentry. Fires at a visible cell within range 5 for 2. Its shot never follows a moved target.', behaviorRam: 'Charger. Telegraphs a straight charge up to four cells, dealing 3 along the shown path. Otherwise moves one cell.', behaviorWeaver: 'Weaver. Alternates a five-cell burst for 2 with a 3 HP repair of the most wounded ally.', behaviorBoss: 'Final Warden. Phase I alternates row beams and bursts. At half HP, phase II announces a stronger row-and-column beam.',
      heroHit: '{hero} takes {amount} damage.', enemyHit: '{enemy} takes {amount} damage.', enemyDown: '{enemy} shatters.', guardLog: '{hero} gains {amount} Guard.', fortifyLog: 'The team gains {amount} Guard.', thornsLog: 'Glass thorns deal 2 on entry.', shatterLog: 'The crystal bursts for 3 in a cross.', resonanceLog: 'The crystal calls nearby enemies closer.', swapLog: 'Two wardens exchange positions.', mendLog: '{hero} recovers {amount} HP.', moveLog: '{hero} repositions.', vaultLog: '{hero} vaults across the ruins.', reshuffle: 'The discard is shuffled into the draw pile.', turnLog: 'Turn {turn} begins. New intents are locked.', bossPhaseLog: 'Phase II — the fractured crown changes pattern.', bossStart: 'The Dark Warden waits beneath the beacon.', combatStart: 'Enemy intents are visible. Your move.', pushLog: '{enemy} is pushed.', enemyHealLog: '{enemy} repairs {amount} HP.', edgeLog: 'Isolation bonus: +2 damage.',
      hp: 'HP', energyPreview: 'Energy {before} → {after}', noChange: 'The action resolves as shown.', incoming: 'Incoming damage here: {amount}', incomingChange: 'Incoming damage {before} → {after}', crystalRemoved: 'The crystal is destroyed.', isolated: 'Target isolated: +2 damage.', upgraded: 'Upgraded', copies: 'copies', level: 'Level', sound: 'Sound', soundOn: 'Sound on', soundOff: 'Sound off', autoplay: 'Guided expedition · ordinary rules · no cheats', stopAutoplay: 'Stop demo', savedLocally: 'Progress saved locally.', invalidSave: 'The saved expedition could not be read. Start a new one.', close: 'Close', details: 'Details', emptyLog: 'The ceramic is quiet. For now.'
    },
    fr: {
      selectedTarget: 'Case sélectionnée',
      title: 'Les Veilleurs de Verre', titleEm: 'de la dernière lumière', studio: 'Kimi Games · Une création LOB7',
      newExpedition: 'Commencer une expédition', continue: 'Continuer l’expédition', watch: 'Voir une expédition guidée', how: 'Comment jouer',
      homeEyebrow: 'Une expédition tactique en cartes', homeLead: 'Trois petites créatures de verre. Un phare éteint. Lisez chaque intention ennemie, transformez le champ de bataille et guidez votre équipe blessée à travers cinq étapes décisives.',
      localSave: 'Expédition sauvegardée sur cet appareil · English, Français, Español', featureIntent: 'Intentions visibles', featureIntentText: 'Les plans ennemis sont figés avant vos actions.', featureCombo: 'Combinaisons ingénieuses', featureComboText: 'Repoussez, protégez, échangez, éclatez.', featureWounds: 'Blessures persistantes', featureWoundsText: 'Chaque récompense est un vrai choix.',
      mapTitle: 'La route vers le phare', mapLead: 'Choisissez une étape. Vos blessures et votre paquet voyagent avec vous.', stage: 'Étape', finalStage: 'Le phare', deck: 'Votre paquet', collectionHelp: 'Les améliorations renforcent chaque exemplaire. Les nouvelles cartes rejoignent le prochain combat.', seed: 'Graine d’expédition', chooseNode: 'Choisissez un chemin',
      guardian: 'Gardien', scout: 'Éclaireuse', artificer: 'Artificier', guardianRole: 'Protège et repousse', scoutRole: 'Mobile · bonus d’isolement', artificerRole: 'Distance · contrôle des cristaux',
      combat: 'Rencontre', rest: 'Repos', event: 'Événement', final: 'Combat final', travel: 'Entrer', completed: 'Terminé', locked: 'À venir',
      turn: 'Tour', energy: 'Énergie', draw: 'Pioche', discard: 'Défausse', hand: 'Votre main', handHelp: 'Choisissez une carte, puis une cible en surbrillance', endTurn: 'Fin du tour', endHint: 'Résoudre les intentions affichées', intents: 'Intentions ennemies', team: 'Vos veilleurs', log: 'Notes du plateau', noIntents: 'Il ne reste aucun ennemi.',
      move: 'Déplacement', moveAvailable: 'Déplacement libre', moved: 'Déplacé', downed: 'Brisé', guard: 'Garde', confirm: 'Confirmer l’action', cancel: 'Annuler', previewMove: 'Aperçu du déplacement', previewCard: 'Aperçu de l’action', emptyHand: 'Aucune carte en main. Vous pouvez encore vous déplacer ou terminer le tour.', noTargets: 'Aucune cible légale pour cette carte actuellement.', selectAction: 'Choisissez un veilleur à déplacer ou une carte à jouer.',
      targetEnemy: 'Ennemi', targetHero: 'Allié', targetSelf: 'Soi · équipe', targetCell: 'Case vide', targetCrystal: 'Cristal', targetTwo: 'Deux alliés', range: 'Portée', anyRange: 'Équipe',
      rewardTitle: 'Un moment dans la lumière', rewardLead: 'Choisissez une récompense. Les soins ne comptent que si vous survivez à la suite.', newCard: 'Nouvelle carte', upgradeCard: 'Améliorer une carte', healTeam: 'Soigner l’équipe', takeReward: 'Choisir cette récompense',
      restTitle: 'La serre silencieuse', restLead: 'Un jardin abrité offre le temps d’un choix délicat.', restHeal: 'Se reposer parmi les fougères', restHealText: 'Restaure 6 PV à chaque veilleur.', restUpgrade: 'Accorder le verre', restUpgradeText: 'Améliore chaque exemplaire de {card}, sans restaurer de PV.',
      eventTitle: 'Les archives résonnantes', eventLead: 'Une ancienne lumière sommeille sous des mains prudentes. Quelque chose répond.', eventSalvage: 'Extraire le résonateur', eventSalvageText: 'Chaque veilleur perd 1 PV. Ajoutez {card} à votre paquet.', eventHeal: 'Libérer la lumière captive', eventHealText: 'Restaure 4 PV à chaque veilleur.',
      victoryTitle: 'La lumière se souvient', victoryLead: 'Le faisceau tourne au-dessus des jardins en ruine. Trois petites silhouettes brillent sur son passage, transformées par chaque choix qui les a conduites ici.', defeatTitle: 'Le verre se tait', defeatLead: 'Le phare reste éteint, mais son écho persiste. Essayez une autre route, une autre graine ou de nouvelles combinaisons avec les mêmes cartes.',
      retrySeed: 'Rejouer cette graine', newSeed: 'Nouvelle expédition', backHome: 'Écran titre', score: 'Score', turns: 'Tours de combat', cardsPlayed: 'Cartes jouées', crystals: 'Cristaux brisés', route: 'Étapes accomplies',
      helpTitle: 'Comment guider les veilleurs', helpGoal: 'Traversez cinq étapes, puis rallumez le phare. Vous gagnez en vainquant le Veilleur final et perdez si les trois héros sont brisés.', helpTurn: 'Au début de votre tour, les intentions ennemies sont déjà figées. Chaque héros vivant peut se déplacer une fois de deux cases accessibles au maximum. Dépensez trois énergies partagées, puis terminez le tour pour résoudre les actions annoncées.', helpCards: 'Les cartes inutilisées rejoignent la défausse. Vous reconstituez une main de cinq cartes chaque tour ; quand la pioche est vide, la défausse est mélangée avec la séquence aléatoire reproductible sauvegardée. Les blessures persistent. Après une victoire, les héros brisés reviennent à 1 PV.', helpIntent: 'Une attaque de case frappe cette case exacte, même si sa cible initiale s’est déplacée. Un déplacement ou une charge suit le chemin affiché et s’arrête s’il est bloqué. Un soin ne change jamais de cible. Sélectionnez un ennemi ou son bouton ⓘ pour comprendre son plan.', helpElements: 'La pierre bloque les déplacements et les lignes de vue. Les cristaux volatils bloquent leur case jusqu’à leur destruction. Les ronces de verre infligent 2 dégâts à l’entrée, aux deux camps. La Garde absorbe les dégâts pendant le tour ennemi à venir, puis expire.', helpControls: 'Cliquez ou touchez un héros ou une carte pour voir les actions légales. Choisissez une cible en surbrillance pour inspecter le résultat déterministe. Confirmez pour agir ou annulez librement avant confirmation. Échap annule ; Espace termine le tour ; M coupe ou active le son.', helpBoss: 'Le Veilleur final change à moitié de vie : ses rayons de ligne annoncés deviennent un motif ligne-et-colonne infligeant 3 dégâts. L’intention en cours ne change jamais pendant la transition.',
      intentAttack: 'Attaque {cell} pour {damage}', intentArea: 'Explosion autour de {cell} pour {damage}', intentMove: 'Déplacement vers {cell}', intentHold: 'Reste sur place', intentCharge: 'Charge jusqu’à {cell} · {damage} dégâts', intentHeal: 'Restaure {amount} PV à {target}', intentRow: 'Rayon sur la rangée {row} · {damage} dégâts', intentCross: 'Ligne et colonne via {cell} · {damage} dégâts',
      behaviorHound: 'Poursuivant. Avance de deux cases vers le veilleur le plus proche ; attaque une case adjacente pour 2.', behaviorSentry: 'Sentinelle. Tire sur une case visible à portée 5 pour 2. Le tir ne suit jamais une cible déplacée.', behaviorRam: 'Bélier. Annonce une charge droite de quatre cases maximum, infligeant 3 sur le chemin. Sinon, avance d’une case.', behaviorWeaver: 'Tisseuse. Alterne une explosion de cinq cases pour 2 et une réparation de 3 PV de l’allié le plus blessé.', behaviorBoss: 'Veilleur final. La phase I alterne rayons de rangée et explosions. À moitié de vie, la phase II annonce un rayon ligne-et-colonne plus puissant.',
      heroHit: '{hero} subit {amount} dégâts.', enemyHit: '{enemy} subit {amount} dégâts.', enemyDown: '{enemy} se brise.', guardLog: '{hero} gagne {amount} de Garde.', fortifyLog: 'L’équipe gagne {amount} de Garde.', thornsLog: 'Les ronces de verre infligent 2 à l’entrée.', shatterLog: 'Le cristal explose pour 3 en croix.', resonanceLog: 'Le cristal attire les ennemis proches.', swapLog: 'Deux veilleurs échangent leurs positions.', mendLog: '{hero} récupère {amount} PV.', moveLog: '{hero} se repositionne.', vaultLog: '{hero} franchit les ruines.', reshuffle: 'La défausse est mélangée dans la pioche.', turnLog: 'Le tour {turn} commence. Nouvelles intentions figées.', bossPhaseLog: 'Phase II — la couronne fracturée change de motif.', bossStart: 'Le Veilleur obscur attend sous le phare.', combatStart: 'Les intentions ennemies sont visibles. À vous de jouer.', pushLog: '{enemy} est repoussé.', enemyHealLog: '{enemy} répare {amount} PV.', edgeLog: 'Bonus d’isolement : +2 dégâts.',
      hp: 'PV', energyPreview: 'Énergie {before} → {after}', noChange: 'L’action se résout comme indiqué.', incoming: 'Dégâts entrants ici : {amount}', incomingChange: 'Dégâts entrants {before} → {after}', crystalRemoved: 'Le cristal est détruit.', isolated: 'Cible isolée : +2 dégâts.', upgraded: 'Améliorée', copies: 'exemplaires', level: 'Niveau', sound: 'Son', soundOn: 'Son activé', soundOff: 'Son coupé', autoplay: 'Expédition guidée · règles ordinaires · sans triche', stopAutoplay: 'Arrêter la démo', savedLocally: 'Progression sauvegardée localement.', invalidSave: 'L’expédition sauvegardée est illisible. Commencez-en une nouvelle.', close: 'Fermer', details: 'Détails', emptyLog: 'La céramique est silencieuse. Pour l’instant.'
    },
    es: {
      selectedTarget: 'Casilla seleccionada',
      title: 'Los Vigías de Cristal', titleEm: 'de la última luz', studio: 'Kimi Games · Una creación de LOB7',
      newExpedition: 'Iniciar una expedición', continue: 'Continuar la expedición', watch: 'Ver una expedición guiada', how: 'Cómo jugar',
      homeEyebrow: 'Una expedición táctica de cartas', homeLead: 'Tres pequeñas criaturas de cristal. Un faro apagado. Lee cada intención enemiga, transforma el campo de batalla y guía a tu equipo herido por cinco etapas decisivas.',
      localSave: 'Expedición guardada en este dispositivo · English, Français, Español', featureIntent: 'Intenciones visibles', featureIntentText: 'Los planes enemigos se fijan antes de actuar.', featureCombo: 'Combinaciones ingeniosas', featureComboText: 'Empuja, protege, intercambia y estalla.', featureWounds: 'Heridas persistentes', featureWoundsText: 'Cada recompensa es una decisión real.',
      mapTitle: 'El camino hacia el faro', mapLead: 'Elige una etapa. Tus heridas y tu mazo viajan contigo.', stage: 'Etapa', finalStage: 'El faro', deck: 'Tu mazo', collectionHelp: 'Las mejoras fortalecen cada copia. Las cartas nuevas se unen al próximo combate.', seed: 'Semilla de expedición', chooseNode: 'Elige un camino',
      guardian: 'Guardián', scout: 'Exploradora', artificer: 'Artificiero', guardianRole: 'Protege y empuja', scoutRole: 'Móvil · bonus de aislamiento', artificerRole: 'A distancia · control de cristales',
      combat: 'Encuentro', rest: 'Descanso', event: 'Evento', final: 'Combate final', travel: 'Entrar', completed: 'Completado', locked: 'Más adelante',
      turn: 'Turno', energy: 'Energía', draw: 'Robo', discard: 'Descarte', hand: 'Tu mano', handHelp: 'Elige una carta y luego un objetivo iluminado', endTurn: 'Fin del turno', endHint: 'Resolver las intenciones mostradas', intents: 'Intenciones enemigas', team: 'Tus vigías', log: 'Notas del tablero', noIntents: 'No quedan enemigos.',
      move: 'Movimiento', moveAvailable: 'Movimiento gratis', moved: 'Movido', downed: 'Quebrado', guard: 'Guardia', confirm: 'Confirmar acción', cancel: 'Cancelar', previewMove: 'Vista previa del movimiento', previewCard: 'Vista previa de la acción', emptyHand: 'No hay cartas en la mano. Aún puedes moverte o terminar el turno.', noTargets: 'No hay un objetivo legal para esta carta ahora.', selectAction: 'Elige un vigía para mover o una carta para actuar.',
      targetEnemy: 'Enemigo', targetHero: 'Aliado', targetSelf: 'Uno mismo · equipo', targetCell: 'Casilla vacía', targetCrystal: 'Cristal', targetTwo: 'Dos aliados', range: 'Alcance', anyRange: 'Equipo',
      rewardTitle: 'Un momento en la luz', rewardLead: 'Elige una recompensa. La curación solo importa si sobrevives a lo que viene.', newCard: 'Carta nueva', upgradeCard: 'Mejorar una carta', healTeam: 'Curar al equipo', takeReward: 'Elegir esta recompensa',
      restTitle: 'El invernadero silencioso', restLead: 'Un jardín protegido ofrece tiempo para una decisión cuidadosa.', restHeal: 'Descansar entre helechos', restHealText: 'Restaura 6 PV a cada vigía.', restUpgrade: 'Afinar el cristal', restUpgradeText: 'Mejora cada copia de {card}, pero no restaura PV.',
      eventTitle: 'El archivo resonante', eventLead: 'Una luz antigua duerme bajo manos cuidadosas. Algo responde.', eventSalvage: 'Recuperar el resonador', eventSalvageText: 'Cada vigía pierde 1 PV. Añade {card} a tu mazo.', eventHeal: 'Liberar la luz cautiva', eventHealText: 'Restaura 4 PV a cada vigía.',
      victoryTitle: 'La luz recuerda', victoryLead: 'El haz gira sobre los jardines en ruinas. Tres pequeñas siluetas brillan a su paso, cambiadas por cada decisión que las trajo hasta aquí.', defeatTitle: 'El cristal calla', defeatLead: 'El faro sigue apagado, pero su eco no ha desaparecido. Prueba otra ruta, otra semilla o una forma distinta de combinar las mismas cartas.',
      retrySeed: 'Repetir esta semilla', newSeed: 'Nueva expedición', backHome: 'Pantalla de título', score: 'Puntuación', turns: 'Turnos de combate', cardsPlayed: 'Cartas jugadas', crystals: 'Cristales destruidos', route: 'Etapas completadas',
      helpTitle: 'Cómo guiar a los vigías', helpGoal: 'Cruza cinco etapas y vuelve a encender el faro. Ganas al derrotar al Vigía final y pierdes si los tres héroes se quiebran.', helpTurn: 'Al comenzar tu turno, las intenciones enemigas ya están fijadas. Cada héroe vivo puede moverse una vez hasta dos casillas accesibles. Gasta tres energías compartidas en cartas y termina el turno para resolver las acciones anunciadas.', helpCards: 'Las cartas sin usar van al descarte. Robas hasta cinco cada turno; cuando el mazo se vacía, el descarte se baraja con la secuencia aleatoria reproducible guardada. Las heridas persisten. Los héroes caídos vuelven con 1 PV tras ganar un encuentro.', helpIntent: 'Un ataque a una casilla golpea esa casilla exacta aunque su objetivo original se mueva. Un movimiento o carga sigue el camino mostrado y se detiene si queda bloqueado. La curación nunca cambia de objetivo. Selecciona un enemigo o su botón ⓘ para conocer su plan.', helpElements: 'La piedra bloquea el movimiento y la línea de visión. Los cristales volátiles bloquean su casilla hasta estallar. Las espinas de cristal hacen 2 de daño al entrar, a ambos equipos. La Guardia absorbe daño durante el próximo turno enemigo y después expira.', helpControls: 'Haz clic o toca un héroe o una carta para ver las acciones legales. Elige un objetivo iluminado para inspeccionar el resultado determinista. Confirma para actuar o cancela antes de confirmar. Escape cancela; Espacio termina el turno; M activa o silencia el sonido.', helpBoss: 'El Vigía final cambia a mitad de vida: sus rayos de fila anunciados se convierten en un patrón de fila y columna que hace 3 de daño. La intención actual nunca cambia durante la transición.',
      intentAttack: 'Ataca {cell} por {damage}', intentArea: 'Explosión alrededor de {cell} por {damage}', intentMove: 'Se mueve hacia {cell}', intentHold: 'Mantiene la posición', intentCharge: 'Carga hasta {cell} · {damage} de daño', intentHeal: 'Restaura {amount} PV a {target}', intentRow: 'Rayo por la fila {row} · {damage} de daño', intentCross: 'Fila y columna por {cell} · {damage} de daño',
      behaviorHound: 'Perseguidor. Avanza hasta dos casillas hacia el vigía más cercano; ataca una casilla adyacente por 2.', behaviorSentry: 'Centinela. Dispara a una casilla visible a alcance 5 por 2. El disparo nunca sigue a un objetivo movido.', behaviorRam: 'Ariete. Anuncia una carga recta de hasta cuatro casillas, con 3 de daño en el camino. Si no, avanza una.', behaviorWeaver: 'Tejedora. Alterna una explosión de cinco casillas por 2 con una reparación de 3 PV al aliado más herido.', behaviorBoss: 'Vigía final. La fase I alterna rayos de fila y explosiones. A mitad de vida, la fase II anuncia un rayo de fila y columna más fuerte.',
      heroHit: '{hero} recibe {amount} de daño.', enemyHit: '{enemy} recibe {amount} de daño.', enemyDown: '{enemy} se quiebra.', guardLog: '{hero} gana {amount} de Guardia.', fortifyLog: 'El equipo gana {amount} de Guardia.', thornsLog: 'Las espinas de cristal hacen 2 al entrar.', shatterLog: 'El cristal estalla por 3 en cruz.', resonanceLog: 'El cristal atrae a los enemigos cercanos.', swapLog: 'Dos vigías intercambian posiciones.', mendLog: '{hero} recupera {amount} PV.', moveLog: '{hero} cambia de posición.', vaultLog: '{hero} salta por las ruinas.', reshuffle: 'El descarte se baraja en el mazo de robo.', turnLog: 'Comienza el turno {turn}. Nuevas intenciones fijadas.', bossPhaseLog: 'Fase II: la corona fracturada cambia de patrón.', bossStart: 'El Vigía Oscuro espera bajo el faro.', combatStart: 'Las intenciones enemigas son visibles. Te toca.', pushLog: '{enemy} es empujado.', enemyHealLog: '{enemy} repara {amount} PV.', edgeLog: 'Bonus de aislamiento: +2 de daño.',
      hp: 'PV', energyPreview: 'Energía {before} → {after}', noChange: 'La acción se resuelve como se muestra.', incoming: 'Daño entrante aquí: {amount}', incomingChange: 'Daño entrante {before} → {after}', crystalRemoved: 'El cristal queda destruido.', isolated: 'Objetivo aislado: +2 de daño.', upgraded: 'Mejorada', copies: 'copias', level: 'Nivel', sound: 'Sonido', soundOn: 'Sonido activado', soundOff: 'Sonido silenciado', autoplay: 'Expedición guiada · reglas normales · sin trucos', stopAutoplay: 'Detener demo', savedLocally: 'Progreso guardado localmente.', invalidSave: 'No se pudo leer la expedición guardada. Inicia una nueva.', close: 'Cerrar', details: 'Detalles', emptyLog: 'La cerámica está en silencio. Por ahora.'
    }
  };

  const CARD_TEXT = {
    bash: {
      en: ['Shield Bash', 'Deal {value} damage and push 1 cell. Thorns deal 2 on entry.'], fr: ['Heurt du bouclier', 'Inflige {value} dégâts et repousse d’une case. Les ronces infligent 2 à l’entrée.'], es: ['Golpe de escudo', 'Hace {value} de daño y empuja 1 casilla. Las espinas hacen 2 al entrar.']
    },
    safeguard: {
      en: ['Safeguard', 'Grant {value} Guard to an ally. Absorbs the coming enemy turn.'], fr: ['Sauvegarde', 'Donne {value} de Garde à un allié. Absorbe le prochain tour ennemi.'], es: ['Salvaguarda', 'Da {value} de Guardia a un aliado. Absorbe el próximo turno enemigo.']
    },
    fortify: {
      en: ['Luminous Bulwark', 'Grant {value} Guard to every living warden.'], fr: ['Rempart lumineux', 'Donne {value} de Garde à chaque veilleur vivant.'], es: ['Baluarte luminoso', 'Da {value} de Guardia a cada vigía vivo.']
    },
    edge: {
      en: ['Glass Edge', 'Deal {value} damage, +2 if no other enemy is adjacent to the target.'], fr: ['Fil de verre', 'Inflige {value} dégâts, +2 si aucun autre ennemi n’est adjacent à la cible.'], es: ['Filo de cristal', 'Hace {value} de daño, +2 si ningún otro enemigo es adyacente al objetivo.']
    },
    vault: {
      en: ['Prism Vault', 'Leap to an empty cell. Does not use the free move.'], fr: ['Bond de prisme', 'Saute vers une case vide. N’utilise pas le déplacement libre.'], es: ['Salto de prisma', 'Salta a una casilla vacía. No usa el movimiento gratis.']
    },
    bolt: {
      en: ['Prism Bolt', 'Deal {value} damage. Requires clear line of sight.'], fr: ['Trait de prisme', 'Inflige {value} dégâts. Nécessite une ligne de vue dégagée.'], es: ['Rayo de prisma', 'Hace {value} de daño. Requiere línea de visión despejada.']
    },
    swap: {
      en: ['Transposition', 'Exchange the positions of two living allies.'], fr: ['Transposition', 'Échange les positions de deux alliés vivants.'], es: ['Transposición', 'Intercambia las posiciones de dos aliados vivos.']
    },
    shatter: {
      en: ['Shatter', 'Destroy a crystal. Deal {value} damage to either team in its cell and adjacent cells.'], fr: ['Éclatement', 'Détruit un cristal. Inflige {value} dégâts aux deux camps sur sa case et les cases adjacentes.'], es: ['Estallido', 'Destruye un cristal. Hace {value} de daño a ambos equipos en su casilla y las adyacentes.']
    },
    resonance: {
      en: ['Resonant Call', 'Enemies within {value} cells of a crystal move up to 2 cells toward it. Intents stay locked.'], fr: ['Appel résonnant', 'Les ennemis à {value} cases du cristal avancent de 2 cases maximum vers lui. Les intentions restent figées.'], es: ['Llamada resonante', 'Los enemigos a {value} casillas del cristal avanzan hasta 2 hacia él. Las intenciones no cambian.']
    },
    mend: {
      en: ['Mending Light', 'Restore {value} HP to a living ally, up to its maximum.'], fr: ['Lumière réparatrice', 'Restaure {value} PV à un allié vivant, jusqu’à son maximum.'], es: ['Luz reparadora', 'Restaura {value} PV a un aliado vivo, hasta su máximo.']
    }
  };
  const ENEMY_TEXT = {
    hound: { en: 'Thorn Hound', fr: 'Limier de ronces', es: 'Sabueso de espinas' },
    sentry: { en: 'Prism Sentry', fr: 'Sentinelle de prisme', es: 'Centinela de prisma' },
    ram: { en: 'Basalt Ram', fr: 'Bélier de basalte', es: 'Ariete de basalto' },
    weaver: { en: 'Thorn Weaver', fr: 'Tisseuse de ronces', es: 'Tejedora de espinas' },
    boss: { en: 'The Dark Warden', fr: 'Le Veilleur obscur', es: 'El Vigía Oscuro' }
  };
  const NODE_TEXT = {
    combatNames: {
      en: ['Broken Gate', 'Moss Arcade', 'Prism Crossing', 'Sunken Court', 'Last Ascent'], fr: ['Porte brisée', 'Galerie de mousse', 'Croisée des prismes', 'Cour engloutie', 'Dernière ascension'], es: ['Puerta rota', 'Galería de musgo', 'Cruce de prismas', 'Patio hundido', 'Último ascenso']
    },
    rest: { en: 'Silent Conservatory', fr: 'Serre silencieuse', es: 'Invernadero silencioso' },
    event: { en: 'Echoing Archive', fr: 'Archives résonnantes', es: 'Archivo resonante' },
    final: { en: 'The Dark Lighthouse', fr: 'Le phare obscur', es: 'El faro oscuro' },
    layouts: {
      en: ['Cloister of echoes', 'Sunken garden', 'Stair of shards'], fr: ['Cloître des échos', 'Jardin englouti', 'Escalier d’éclats'], es: ['Claustro de ecos', 'Jardín hundido', 'Escalera de fragmentos']
    }
  };

  let preferences = { lang: 'en', sound: true };
  try { preferences = { ...preferences, ...JSON.parse(localStorage.getItem(PREF_KEY) || '{}') }; } catch (_) {}
  let lang = ['en', 'fr', 'es'].includes(preferences.lang) ? preferences.lang : 'en';
  let state = null;
  let savedState = null;
  let view = 'home';
  let selectedHero = null;
  let selectedCard = null;
  let selectedTargets = [];
  let pending = null;
  let modal = null;
  let toastTimer = null;
  let audioContext = null;
  let autoplay = params.get('autoplay') === '1';
  let autoTimer = null;
  let autoBusy = false;

  function t(key, vars = {}) {
    let value = (TEXT[lang] && TEXT[lang][key]) || TEXT.en[key] || key;
    Object.entries(vars).forEach(([name, replacement]) => { value = value.replaceAll(`{${name}}`, String(replacement)); });
    return value;
  }
  function esc(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
  function cardText(cardId) { return (CARD_TEXT[cardId] && (CARD_TEXT[cardId][lang] || CARD_TEXT[cardId].en)) || [cardId, '']; }
  function cardName(cardId) { return cardText(cardId)[0]; }
  function enemyName(type) { return (ENEMY_TEXT[type] && (ENEMY_TEXT[type][lang] || ENEMY_TEXT[type].en)) || type; }
  function heroName(id) { return t(id); }
  function coord(cell) { return `${String.fromCharCode(65 + cell.x)}${cell.y + 1}`; }
  function savePreferences() {
    preferences.lang = lang;
    try { localStorage.setItem(PREF_KEY, JSON.stringify(preferences)); } catch (_) {}
  }
  function validSave(candidate) {
    return candidate && candidate.version === E.SAVE_VERSION && Array.isArray(candidate.heroes) && candidate.heroes.length === 3 && Array.isArray(candidate.map) && typeof candidate.rngState === 'number' && typeof candidate.screen === 'string';
  }
  function readSave() {
    try {
      const candidate = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return validSave(candidate) ? candidate : null;
    } catch (_) { return null; }
  }
  function saveGame() {
    if (!state || view === 'home') return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); savedState = E.clone(state); } catch (_) {}
  }
  function toast(message) {
    toastNode.textContent = message;
    toastNode.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 2300);
  }
  function randomSeed() {
    const values = new Uint32Array(1);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(values);
    else values[0] = Date.now() >>> 0;
    return `light-${values[0].toString(16).padStart(8, '0')}`;
  }
  function playSound(kind) {
    if (!preferences.sound) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const notes = kind === 'victory' ? [392, 523.25, 659.25] : kind === 'hit' ? [130, 98] : kind === 'guard' ? [440, 660] : [330, 494];
      notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = kind === 'hit' ? 'triangle' : 'sine';
        oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
        gain.gain.setValueAtTime(0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.055, now + index * 0.07 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.22);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(now + index * 0.07);
        oscillator.stop(now + index * 0.07 + 0.24);
      });
    } catch (_) {}
  }

  function brandSvg() {
    return '<svg class="brand-mark" viewBox="0 0 40 52" aria-hidden="true"><path d="M20 2 34 19 27 46 20 51 13 46 6 19Z" fill="#43cbb9" stroke="#effff9" stroke-width="1.5"/><path d="m20 2 1 41-8-24Z" fill="#effff9" opacity=".45"/><path d="m6 19 14 5 14-5" fill="none" stroke="#102e33" stroke-width="1.5"/></svg>';
  }
  function cracks() {
    return '<path d="m40 29-5 12 7 7-8 15 3 13M35 41l-9 4m16 3 9 5" fill="none" stroke="#f6fffb" stroke-width="1.6" opacity=".85"/>';
  }
  function heroSvg(id, injured = false) {
    const crack = injured ? cracks() : '';
    if (id === 'guardian') return `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><linearGradient id="guardianGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#effff9"/><stop offset=".32" stop-color="#63e6d2"/><stop offset="1" stop-color="#168a7d"/></linearGradient></defs><ellipse cx="40" cy="94" rx="25" ry="5" fill="#102e33" opacity=".18"/><path d="M30 29 26 15 37 7 46 13 51 29Z" fill="url(#guardianGlass)" stroke="#effff9" stroke-width="1.4"/><path d="M28 31 19 55 25 86 40 93 55 84 58 51 48 31Z" fill="url(#guardianGlass)" stroke="#effff9" stroke-width="1.5"/><path d="m34 33 4 47-12-25Z" fill="#effff9" opacity=".35"/><path d="M48 39 68 43 65 70 51 82 43 68Z" fill="#8f4e78" stroke="#f4d8eb" stroke-width="2"/><path d="m49 46 12 2-2 17-8 8-4-7Z" fill="#c68caf" opacity=".7"/><path d="M22 50 10 63l5 7 12-12" fill="url(#guardianGlass)" stroke="#effff9" stroke-width="1.4"/>${crack}</svg>`;
    if (id === 'scout') return `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><linearGradient id="scoutGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff8df"/><stop offset=".35" stop-color="#ffd27e"/><stop offset="1" stop-color="#c87937"/></linearGradient></defs><ellipse cx="39" cy="94" rx="22" ry="4" fill="#102e33" opacity=".18"/><path d="M30 25 34 8 47 5 52 23 44 32Z" fill="url(#scoutGlass)" stroke="#fff8df" stroke-width="1.4"/><path d="m33 30-9 24 8 35 11 4 12-36-12-27Z" fill="url(#scoutGlass)" stroke="#fff8df" stroke-width="1.4"/><path d="m37 34-5 44 10 8-1-44Z" fill="#fff8df" opacity=".35"/><path d="M26 43 9 74l19-9 14-21" fill="#8f4e78" stroke="#f4d8eb" stroke-width="1.5"/><path d="m52 37 18 38-5 2-21-35" fill="#f6fffb" stroke="#43cbb9" stroke-width="1.3"/><path d="m30 88-6 7m19-5 7 4" stroke="#fff8df" stroke-width="4" stroke-linecap="round"/>${crack}</svg>`;
    return `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><linearGradient id="artificerGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff1fb"/><stop offset=".35" stop-color="#d894c0"/><stop offset="1" stop-color="#744066"/></linearGradient></defs><ellipse cx="39" cy="94" rx="24" ry="4" fill="#102e33" opacity=".18"/><path d="M27 28 33 10 48 12 52 30 42 35Z" fill="url(#artificerGlass)" stroke="#fff1fb" stroke-width="1.4"/><path d="M29 33 19 76 28 91 47 92 57 72 48 34Z" fill="url(#artificerGlass)" stroke="#fff1fb" stroke-width="1.4"/><path d="m34 37-6 38 10 10 1-42Z" fill="#fff1fb" opacity=".32"/><path d="m24 19 17-13 20 16-8 4-26-1Z" fill="#43cbb9" stroke="#effff9" stroke-width="1.4"/><path d="M57 20 62 86" stroke="#e8a84c" stroke-width="4" stroke-linecap="round"/><path d="m57 7 10 12-9 11-10-11Z" fill="#43cbb9" stroke="#effff9" stroke-width="1.6"/><path d="m57 10 1 14-6-6Z" fill="#effff9" opacity=".6"/>${crack}</svg>`;
  }
  function enemySvg(type, injured = false) {
    const crack = injured ? cracks() : '';
    if (type === 'hound') return `<svg viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="41" cy="90" rx="29" ry="5" fill="#102e33" opacity=".2"/><path d="m17 56 9-24 25-5 18 17-8 30-32 4Z" fill="#8f4e78" stroke="#f0bede" stroke-width="1.7"/><path d="m45 30 4-17 10 12 11 4-3 22-17 3Z" fill="#4d2948" stroke="#e8a84c" stroke-width="1.6"/><path d="m24 69-5 19m19-15-1 17m20-20 7 16" stroke="#4d2948" stroke-width="7" stroke-linecap="round"/><path d="m21 48-13-7 8 20" fill="#8f4e78" stroke="#f0bede" stroke-width="1.5"/><path d="m56 36 5 2" stroke="#f6fffb" stroke-width="3" stroke-linecap="round"/><path d="m27 39 13 6-9 7" fill="#e8a84c" opacity=".65"/>${crack}</svg>`;
    if (type === 'sentry') return `<svg viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="40" cy="93" rx="22" ry="4" fill="#102e33" opacity=".2"/><path d="M40 5 58 28 52 83 40 94 28 83 22 28Z" fill="#e8a84c" stroke="#fff0c4" stroke-width="1.7"/><path d="m40 5 1 79-12-55Z" fill="#fff0c4" opacity=".38"/><path d="M22 28 40 39 58 28M28 65l12 8 12-8" fill="none" stroke="#4d2948" stroke-width="2"/><path d="M33 37 40 32 47 37 40 45Z" fill="#4d2948"/><path d="M18 47h-9v25h11m42-25h9v25H60" fill="none" stroke="#8f4e78" stroke-width="4"/>${crack}</svg>`;
    if (type === 'ram') return `<svg viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="40" cy="90" rx="30" ry="5" fill="#102e33" opacity=".22"/><path d="M12 42 28 25 62 32 72 57 57 79 23 75 8 61Z" fill="#596b6a" stroke="#d4e5dc" stroke-width="1.7"/><path d="m48 31 16-20 4 26m-39 3L16 17 10 42" fill="#e8a84c" stroke="#fff0c4" stroke-width="2"/><path d="m50 43 14 2-3 15-15 3-8-10Z" fill="#8f4e78"/><path d="m24 69-5 19m34-15 5 15" stroke="#4d5553" stroke-width="9" stroke-linecap="round"/><path d="m20 43 15-7 4 11-18 8Z" fill="#9bad9f" opacity=".55"/>${crack}</svg>`;
    if (type === 'weaver') return `<svg viewBox="0 0 80 100" aria-hidden="true"><ellipse cx="40" cy="92" rx="26" ry="4" fill="#102e33" opacity=".2"/><path d="m40 9 9 21 19-8-8 20 12 14-21 6-3 25-17-4-5-22-17-11 15-15-1-21 17 8Z" fill="#8f4e78" stroke="#f0bede" stroke-width="1.6"/><path d="m40 26 13 17-6 24-18 2-8-24Z" fill="#43cbb9" stroke="#effff9" stroke-width="1.6"/><path d="m35 32-5 26 9 5 4-25Z" fill="#effff9" opacity=".36"/><path d="M16 74 7 90m54-16 11 15M28 17 20 5" stroke="#e8a84c" stroke-width="3" stroke-linecap="round"/>${crack}</svg>`;
    return `<svg viewBox="0 0 80 100" aria-hidden="true"><defs><linearGradient id="bossGlass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f5d9ec"/><stop offset=".35" stop-color="#9e5a88"/><stop offset="1" stop-color="#3b233b"/></linearGradient></defs><ellipse cx="40" cy="94" rx="30" ry="5" fill="#102e33" opacity=".25"/><path d="M26 29 20 8 34 18 41 2 49 18 64 7 56 31Z" fill="#e8a84c" stroke="#fff0c4" stroke-width="1.5"/><path d="M27 30 15 65 23 91 42 96 62 85 64 54 52 29Z" fill="url(#bossGlass)" stroke="#f5d9ec" stroke-width="1.8"/><path d="m34 35-6 44 13 10-1-49Z" fill="#f5d9ec" opacity=".27"/><path d="M29 43 40 36 53 44 47 56 34 55Z" fill="#102e33"/><path d="m38 40 4 2-2 7" fill="#f6fffb"/><path d="M18 47 5 71m51-27 18 23" stroke="#8f4e78" stroke-width="7" stroke-linecap="round"/>${crack}</svg>`;
  }
  function crystalSvg() {
    return '<svg viewBox="0 0 60 90" aria-hidden="true"><path d="M30 3 48 31 40 79 30 88 18 77 11 31Z" fill="#43cbb9" stroke="#effff9" stroke-width="2"/><path d="m30 3 2 74-13-45Z" fill="#effff9" opacity=".48"/><path d="m11 31 20 9 17-9M19 67l12 7 10-8" fill="none" stroke="#168a7d" stroke-width="2"/><path d="M18 84h25" stroke="#102e33" stroke-width="4" opacity=".25" stroke-linecap="round"/></svg>';
  }
  function iconSvg(name) {
    const paths = {
      bash: '<path d="M17 10 46 15 44 40 30 55 15 42Z"/><path d="m43 38 13 8-9 9"/>',
      safeguard: '<path d="M32 6 52 15 49 41 32 57 15 41 12 15Z"/><path d="m22 31 7 7 14-17"/>',
      fortify: '<path d="M32 5 53 15 50 42 32 58 14 42 11 15Z"/><path d="M32 16v31M20 27h24"/>',
      edge: '<path d="m13 51 34-42 5 2-22 45Z"/><path d="m13 51 17-5M38 14l10 10"/>',
      vault: '<path d="M9 47c12-34 31-34 46 0"/><path d="m44 35 11 12-14 5"/><path d="M13 50v8m38-8v8"/>',
      bolt: '<path d="M8 32h23M38 32h18"/><path d="m30 7-9 20 12-2-5 32 17-37-12 3Z"/>',
      swap: '<path d="M11 22h38m-8-9 9 9-9 9M53 43H15m8-9-9 9 9 9"/>',
      shatter: '<path d="m32 5 16 21-6 27-11 7-12-12-4-23Z"/><path d="m32 5-2 25 11 23M15 27l15 3 18-4M31 30 19 48"/>',
      resonance: '<path d="m32 15 10 15-7 21-11-8-1-19Z"/><path d="M16 17C4 27 4 40 16 49M48 17c12 10 12 23 0 32M9 8c-17 17-17 36 0 50M55 8c17 17 17 36 0 50"/>',
      mend: '<path d="M32 54S9 41 9 23c0-16 19-18 23-5 5-13 24-11 24 5 0 18-24 31-24 31Z"/><path d="M32 23v17M24 31h16"/>',
      combat: '<path d="m13 52 34-40 5 2-22 43ZM11 12l42 40"/>',
      rest: '<path d="M50 53C15 56 7 32 16 9c25 3 41 18 34 44Z"/><path d="M13 55 43 19M25 40l-8-13m17 2 12-2"/>',
      event: '<path d="M13 11h38v43H13Z"/><path d="M21 21h22M21 30h22M21 39h13"/><path d="m45 4 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/>',
      final: '<path d="M24 54h17L37 22H28Z"/><path d="M24 22h17l-3-12H27Z"/><path d="M18 57h29M31 3V0M8 20 0 16m55 4 9-4M7 5l9 6m34 0 8-6"/>',
      heal: '<path d="M32 55S9 42 9 24c0-16 19-18 23-5 5-13 24-11 24 5 0 17-24 31-24 31Z"/><path d="M32 22v18M23 31h18"/>',
      upgrade: '<path d="m32 5 15 20-6 29-11 6-12-12-3-22Z"/><path d="m21 38 8 8 15-22"/>'
    };
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.event}</g></svg>`;
  }
  function homeArtSvg() {
    return '<svg viewBox="0 0 460 500" aria-hidden="true"><path d="M325 396h86l-18-220h-49Z" fill="#173c40"/><path d="M337 177h61l-9-57h-43Z" fill="#8f4e78"/><path d="M352 121h32V84h-32Z" fill="#43cbb9"/><path d="m368 92-185 60 182-29 183 27-180-58Z" fill="#e8a84c" opacity=".32"/><path d="M344 69h48l-8-25h-32Z" fill="#102e33"/><path d="M365 44V19" stroke="#102e33" stroke-width="8"/><path d="M84 415c84-49 191-47 296 0" fill="none" stroke="#173c40" stroke-width="10" stroke-linecap="round" opacity=".3"/><g transform="translate(50 235) scale(1.65)"><path d="M30 29 26 15 37 7 46 13 51 29Z" fill="#63e6d2" stroke="#effff9"/><path d="M28 31 19 55 25 86 40 93 55 84 58 51 48 31Z" fill="#43cbb9" stroke="#effff9"/><path d="M48 39 68 43 65 70 51 82 43 68Z" fill="#8f4e78" stroke="#f4d8eb"/></g><g transform="translate(170 270) scale(1.45)"><path d="M30 25 34 8 47 5 52 23 44 32Z" fill="#ffd27e" stroke="#fff8df"/><path d="m33 30-9 24 8 35 11 4 12-36-12-27Z" fill="#e8a84c" stroke="#fff8df"/><path d="M26 43 9 74l19-9 14-21" fill="#8f4e78"/></g><g transform="translate(270 255) scale(1.5)"><path d="M27 28 33 10 48 12 52 30 42 35Z" fill="#d894c0" stroke="#fff1fb"/><path d="M29 33 19 76 28 91 47 92 57 72 48 34Z" fill="#8f4e78" stroke="#fff1fb"/><path d="m24 19 17-13 20 16-8 4-26-1Z" fill="#43cbb9"/><path d="M57 20 62 86" stroke="#e8a84c" stroke-width="4"/><path d="m57 7 10 12-9 11-10-11Z" fill="#43cbb9"/></g><path d="m67 223 8 12-6 14-10-6-1-13Zm177 152 7 11-5 12-9-5-1-12Z" fill="#43cbb9" opacity=".65"/></svg>';
  }

  function targetLabel(card) {
    const keys = { enemy: 'targetEnemy', hero: 'targetHero', self: 'targetSelf', cell: 'targetCell', crystal: 'targetCrystal', twoHeroes: 'targetTwo' };
    return t(keys[card.target]);
  }
  function nodeName(node) {
    if (node.type === 'combat') return NODE_TEXT.combatNames[lang][node.difficulty] || NODE_TEXT.combatNames.en[node.difficulty];
    return NODE_TEXT[node.type] ? (NODE_TEXT[node.type][lang] || NODE_TEXT[node.type].en) : t(node.type);
  }
  function describeIntent(intent) {
    if (!intent) return t('intentHold');
    if (intent.type === 'move') return intent.path && intent.path.length ? t('intentMove', { cell: coord(intent.destination) }) : t('intentHold');
    if (intent.type === 'charge') return t('intentCharge', { cell: coord(intent.target), damage: intent.damage });
    if (intent.type === 'heal') {
      const target = E.enemyById(state, intent.targetEnemyId);
      return t('intentHeal', { amount: intent.amount, target: target ? enemyName(target.type) : '—' });
    }
    if (intent.type === 'bossRow') return t('intentRow', { row: intent.center.y + 1, damage: intent.damage });
    if (intent.type === 'bossCross') return t('intentCross', { cell: coord(intent.center), damage: intent.damage });
    if (intent.area && intent.area.length > 1) return t('intentArea', { cell: coord(intent.center || intent.area[0]), damage: intent.damage });
    return t('intentAttack', { cell: coord(intent.area[0]), damage: intent.damage });
  }
  function intentBadge(intent) {
    if (!intent) return '';
    if (intent.type === 'heal') return `<span class="intent-badge heal">+${intent.amount}</span>`;
    if (intent.type === 'move') return `<span class="intent-badge move">${intent.path.length ? '→' : '·'}</span>`;
    const symbol = intent.type === 'charge' ? '»' : intent.type.startsWith('boss') ? '✦' : '!';
    return `<span class="intent-badge">${symbol} ${intent.damage}</span>`;
  }
  function renderTopbar() {
    return `<header class="topbar"><button class="brand-button" data-action="home" aria-label="${esc(t('backHome'))}">${brandSvg()}<span><span class="brand-name">${esc(t('title'))}</span><span class="brand-sub">${esc(t('studio'))}</span></span></button>${state && view === 'game' ? `<span class="seed-chip">${esc(t('seed'))} · ${esc(state.seed)}</span>` : ''}<span class="topbar-spacer"></span><div class="language-group" aria-label="Language">${['en', 'fr', 'es'].map(code => `<button class="language-button ${lang === code ? 'active' : ''}" data-action="language" data-lang="${code}" aria-pressed="${lang === code}">${code.toUpperCase()}</button>`).join('')}</div><button class="icon-button" data-action="sound" title="${esc(t(preferences.sound ? 'soundOn' : 'soundOff'))}" aria-label="${esc(t('sound'))}">${preferences.sound ? '♪' : '∅'}</button><button class="icon-button" data-action="help" title="${esc(t('how'))}" aria-label="${esc(t('how'))}">?</button></header>`;
  }
  function renderHome() {
    return `<main class="screen home"><section class="home-hero"><div class="home-copy"><p class="eyebrow">${esc(t('homeEyebrow'))}</p><h1>${esc(t('title'))}<em>${esc(t('titleEm'))}</em></h1><p class="home-lead">${esc(t('homeLead'))}</p><div class="home-actions">${savedState ? `<button class="primary-button" data-action="continue">${esc(t('continue'))}</button>` : ''}<button class="${savedState ? 'secondary-button' : 'primary-button'}" data-action="new-game">${esc(t('newExpedition'))}</button><button class="text-button" data-action="watch">${esc(t('watch'))}</button></div><p class="home-note">${esc(t('localSave'))}</p></div><div class="home-art"><div class="lighthouse-halo"></div><div class="home-figures">${homeArtSvg()}</div></div></section><section class="feature-strip"><div class="feature"><span class="feature-icon"><span>!</span></span><div><strong>${esc(t('featureIntent'))}</strong><br>${esc(t('featureIntentText'))}</div></div><div class="feature"><span class="feature-icon"><span>◆</span></span><div><strong>${esc(t('featureCombo'))}</strong><br>${esc(t('featureComboText'))}</div></div><div class="feature"><span class="feature-icon"><span>+</span></span><div><strong>${esc(t('featureWounds'))}</strong><br>${esc(t('featureWoundsText'))}</div></div></section></main>`;
  }
  function renderTeamSummary() {
    return `<div class="map-summary">${state.heroes.map(hero => `<div class="summary-hero"><span class="hero-portrait">${heroSvg(hero.id, hero.hp <= hero.maxHp / 2)}</span><div><div class="summary-hero-name">${esc(heroName(hero.id))}</div><div class="summary-hero-hp">${hero.hp}/${hero.maxHp} ${esc(t('hp'))}</div><div class="hp-track"><span style="width:${Math.max(0, hero.hp / hero.maxHp * 100)}%"></span></div></div></div>`).join('')}</div>`;
  }
  function renderDeckPanel() {
    const counts = {};
    state.collection.forEach(id => { counts[id] = (counts[id] || 0) + 1; });
    return `<aside class="deck-panel"><h2>${esc(t('deck'))}</h2><p>${esc(t('collectionHelp'))}</p><div class="deck-list">${E.CARD_ORDER.filter(id => counts[id]).map(id => `<div class="deck-item"><span class="deck-item-symbol">◆</span><span>${esc(cardName(id))}</span>${state.upgrades[id] ? `<span class="deck-item-level">+${state.upgrades[id]}</span>` : ''}<span class="deck-item-count">×${counts[id]}</span></div>`).join('')}</div></aside>`;
  }
  function routeNode(node, status) {
    const disabled = status !== 'available';
    return `<button class="route-node ${status} ${node.type === 'final' ? 'final' : ''}" data-action="node" data-id="${esc(node.id)}" ${disabled ? 'disabled' : ''}><span class="route-node-icon">${iconSvg(node.type)}</span><span class="route-node-name">${esc(nodeName(node))}</span><span class="route-node-type">${esc(status === 'completed' ? t('completed') : status === 'locked' ? t('locked') : t(node.type))}</span></button>`;
  }
  function renderMap() {
    const stages = state.map.map((nodes, index) => `<div class="route-stage"><span class="route-stage-label">${esc(t('stage'))} ${index + 1}</span>${nodes.map(node => {
      const completed = state.route.some(step => step.id === node.id);
      const status = completed ? 'completed' : state.stage === index ? 'available' : 'locked';
      return routeNode(node, status);
    }).join('')}</div>`).join('');
    const finalNode = { id: 'final', type: 'final', difficulty: 5 };
    const finalStatus = state.stage >= 5 ? 'available' : 'locked';
    return `<main class="screen map-screen"><div class="map-title"><p class="eyebrow" style="justify-content:center">${esc(t('stage'))} ${Math.min(state.stage + 1, 6)} / 6</p><h1>${esc(t('mapTitle'))}</h1><p>${esc(t('mapLead'))}</p></div>${renderTeamSummary()}<div class="expedition"><section class="route-map" aria-label="${esc(t('chooseNode'))}">${stages}<div class="route-stage"><span class="route-stage-label">${esc(t('finalStage'))}</span>${routeNode(finalNode, finalStatus)}</div></section>${renderDeckPanel()}</div></main>`;
  }
  function choiceCard({ kind, icon, name, description, action, id }) {
    return `<button class="choice-card" data-action="${action}" data-id="${esc(id)}"><span class="choice-kind">${esc(kind)}</span><span class="choice-art">${iconSvg(icon)}</span><h2>${esc(name)}</h2><p>${esc(description)}</p><span class="choice-cta">${esc(t('takeReward'))} →</span></button>`;
  }
  function renderReward() {
    const options = state.reward.options.map(option => {
      if (option.kind === 'heal') return choiceCard({ kind: t('healTeam'), icon: 'heal', name: `+${option.amount} ${t('hp')}`, description: t('restHealText').replace('6', option.amount), action: 'reward', id: option.id });
      const info = E.cardInfo(state, option.cardId);
      const text = cardText(option.cardId);
      return choiceCard({ kind: t(option.kind === 'new' ? 'newCard' : 'upgradeCard'), icon: option.cardId, name: cardName(option.cardId), description: text[1].replaceAll('{value}', info.value).replaceAll('{range}', info.range), action: 'reward', id: option.id });
    }).join('');
    return `<main class="screen choice-screen"><div class="choice-heading"><p class="eyebrow" style="justify-content:center">${esc(t('combat'))} · +100</p><h1>${esc(t('rewardTitle'))}</h1></div><p class="choice-subtitle">${esc(t('rewardLead'))}</p>${renderTeamSummary()}<div class="choice-grid">${options}</div></main>`;
  }
  function renderRest() {
    const id = state.rest.upgradeCardId;
    return `<main class="screen choice-screen"><div class="choice-heading"><p class="eyebrow" style="justify-content:center">${esc(t('rest'))}</p><h1>${esc(t('restTitle'))}</h1></div><p class="choice-subtitle">${esc(t('restLead'))}</p>${renderTeamSummary()}<div class="choice-grid">${choiceCard({ kind: t('healTeam'), icon: 'rest', name: t('restHeal'), description: t('restHealText'), action: 'rest', id: 'heal' })}${choiceCard({ kind: t('upgradeCard'), icon: id, name: cardName(id), description: t('restUpgradeText', { card: cardName(id) }), action: 'rest', id: 'upgrade' })}</div></main>`;
  }
  function renderEvent() {
    const id = state.event.newCardId;
    return `<main class="screen choice-screen"><div class="choice-heading"><p class="eyebrow" style="justify-content:center">${esc(t('event'))}</p><h1>${esc(t('eventTitle'))}</h1></div><p class="choice-subtitle">${esc(t('eventLead'))}</p>${renderTeamSummary()}<div class="choice-grid">${choiceCard({ kind: t('newCard'), icon: id, name: cardName(id), description: t('eventSalvageText', { card: cardName(id) }), action: 'event', id: 'salvage' })}${choiceCard({ kind: t('healTeam'), icon: 'heal', name: t('eventHeal'), description: t('eventHealText'), action: 'event', id: 'heal' })}</div></main>`;
  }
  function renderEnding() {
    const victory = state.ending && state.ending.victory;
    const stats = [[state.score, 'score'], [state.stats.turns, 'turns'], [state.stats.cardsPlayed, 'cardsPlayed'], [state.stats.crystals, 'crystals'], [state.route.length, 'route']];
    return `<main class="screen ending-screen"><div class="ending-art">${iconSvg(victory ? 'final' : 'shatter')}</div><p class="eyebrow" style="justify-content:center">${esc(t('seed'))} · ${esc(state.seed)}</p><h1>${esc(t(victory ? 'victoryTitle' : 'defeatTitle'))}</h1><p class="ending-lead">${esc(t(victory ? 'victoryLead' : 'defeatLead'))}</p><div class="ending-stats">${stats.map(([value, key]) => `<div class="ending-stat"><strong>${value}</strong><span>${esc(t(key))}</span></div>`).join('')}</div><div class="ending-actions"><button class="primary-button" data-action="retry">${esc(t('retrySeed'))}</button><button class="secondary-button" data-action="new-game">${esc(t('newSeed'))}</button><button class="text-button" data-action="home">${esc(t('backHome'))}</button></div></main>`;
  }
  function currentLegalTargets() {
    if (pending || state.screen !== 'combat') return [];
    if (selectedCard) return E.getCardTargets(state, selectedCard, selectedTargets);
    if (selectedHero) return E.getMoveTargets(state, selectedHero);
    return [];
  }
  function targetAtCell(target, x, y) {
    if (target.kind === 'cell') return target.x === x && target.y === y;
    const entity = target.kind === 'hero' ? E.heroById(state, target.id) : target.kind === 'enemy' ? E.enemyById(state, target.id) : E.crystalById(state, target.id);
    return entity && entity.x === x && entity.y === y;
  }
  function renderBoard() {
    const combat = state.combat;
    const legal = currentLegalTargets();
    const chosenTargets = pending ? (pending.kind === 'move' ? [pending.target] : pending.targets) : selectedTargets;
    const cells = [];
    for (let y = 0; y < E.HEIGHT; y += 1) {
      for (let x = 0; x < E.WIDTH; x += 1) {
        const hero = state.heroes.find(item => item.x === x && item.y === y);
        const enemy = E.aliveEnemies(state).find(item => item.x === x && item.y === y);
        const crystal = E.crystalAt(state, x, y);
        const obstacle = E.obstacleAt(state, x, y);
        const hazard = E.hazardAt(state, x, y);
        const intent = enemy ? combat.intents.find(item => item.enemyId === enemy.id) : null;
        const incoming = E.incomingAt(state, x, y);
        const isLegal = legal.some(target => targetAtCell(target, x, y));
        const chosen = chosenTargets.some(target => targetAtCell(target, x, y));
        const names = [coord({ x, y })];
        if (chosen) names.push(t('selectedTarget'));
        if (hero) names.push(heroName(hero.id), `${hero.hp} ${t('hp')}`);
        if (enemy) names.push(enemyName(enemy.type), `${enemy.hp} ${t('hp')}`, intent ? describeIntent(intent) : '');
        if (crystal) names.push(t('targetCrystal'));
        if (incoming) names.push(t('incoming', { amount: incoming }));
        cells.push(`<div class="cell ${obstacle ? 'obstacle' : ''} ${incoming ? 'threatened' : ''} ${isLegal ? 'legal' : ''} ${chosen ? 'chosen' : ''}" data-action="cell" data-x="${x}" data-y="${y}" role="button" tabindex="0" aria-pressed="${chosen}" aria-label="${esc(names.filter(Boolean).join(' · '))}"><span class="cell-coordinate">${coord({ x, y })}</span>${chosen ? '<span class="selection-marker" aria-hidden="true">✓</span>' : ''}${obstacle ? '<span class="obstacle-shape"></span>' : ''}${hazard ? '<span class="hazard-shape"></span>' : ''}${crystal ? `<span class="crystal">${crystalSvg()}</span>` : ''}${incoming ? `<span class="threat-marker">×${incoming}</span>` : ''}${hero ? `<span class="unit hero ${hero.hp <= 0 ? 'downed' : ''}"><span class="unit-svg">${heroSvg(hero.id, hero.hp <= hero.maxHp / 2)}</span><span class="unit-hp"><span style="width:${Math.max(0, hero.hp / hero.maxHp * 100)}%"></span></span>${hero.guard ? '<span class="unit-guard"></span>' : ''}</span>` : ''}${enemy ? `<span class="unit enemy"><span class="unit-svg">${enemySvg(enemy.type, enemy.hp <= enemy.maxHp / 2)}</span><span class="unit-hp"><span style="width:${enemy.hp / enemy.maxHp * 100}%"></span></span></span>${intentBadge(intent)}<button class="intent-info" data-action="enemy-info" data-id="${enemy.id}" aria-label="${esc(t('details'))}: ${esc(enemyName(enemy.type))}">i</button>` : ''}</div>`);
      }
    }
    return `<div class="board-frame"><div class="board" role="grid" aria-label="7 × 5">${cells.join('')}</div></div><div class="board-legend"><span class="legend-item"><span class="legend-symbol threat">×</span>${esc(t('intents'))}</span><span class="legend-item"><span class="legend-symbol move">◆</span>${esc(t('selectAction'))}</span><span class="legend-item"><span class="legend-symbol crystal-legend"></span>${esc(t('targetCrystal'))}</span></div>`;
  }
  function renderSidebar() {
    const combat = state.combat;
    return `<aside class="battle-sidebar"><section class="sidebar-section"><h2 class="sidebar-title">${esc(t('team'))}</h2>${state.heroes.map(hero => `<button class="hero-row ${selectedHero === hero.id ? 'selected' : ''} ${hero.hp <= 0 ? 'downed' : ''}" data-action="hero" data-id="${hero.id}"><span class="hero-portrait">${heroSvg(hero.id, hero.hp <= hero.maxHp / 2)}</span><span><span class="hero-row-name">${esc(heroName(hero.id))}</span><span class="hero-row-meta">${hero.hp}/${hero.maxHp} ${esc(t('hp'))}${hero.guard ? ` · ${hero.guard} ${esc(t('guard'))}` : ''}</span><span class="hp-track"><span style="width:${Math.max(0, hero.hp / hero.maxHp * 100)}%"></span></span></span><span class="hero-state">${hero.hp <= 0 ? esc(t('downed')) : hero.moved ? esc(t('moved')) : esc(t('moveAvailable'))}</span></button>`).join('')}</section><section class="sidebar-section"><h2 class="sidebar-title">${esc(t('intents'))}<span>ⓘ</span></h2>${combat.intents.filter(intent => { const enemy = E.enemyById(state, intent.enemyId); return enemy && enemy.hp > 0; }).map(intent => { const enemy = E.enemyById(state, intent.enemyId); return `<button class="intent-row" data-action="enemy-info" data-id="${enemy.id}"><span class="intent-row-icon">${intent.type === 'move' ? '→' : intent.type === 'heal' ? '+' : '!'}</span><span><span class="intent-row-name">${esc(enemyName(enemy.type))}</span><span class="intent-row-text">${esc(describeIntent(intent))}</span></span></button>`; }).join('') || esc(t('noIntents'))}</section><section class="sidebar-section log-section"><h2 class="sidebar-title">${esc(t('log'))}</h2><ul class="log-list">${combat.log.slice(-5).reverse().map(logText).map(text => `<li>${esc(text)}</li>`).join('') || `<li>${esc(t('emptyLog'))}</li>`}</ul></section></aside>`;
  }
  function logText(entry) {
    const hero = entry.heroId ? heroName(entry.heroId) : '';
    const enemy = entry.enemyId && E.enemyById(state, entry.enemyId) ? enemyName(E.enemyById(state, entry.enemyId).type) : '';
    if (entry.type === 'heroHit') return t('heroHit', { hero, amount: entry.amount });
    if (entry.type === 'enemyHit') return t('enemyHit', { enemy, amount: entry.amount });
    if (entry.type === 'enemyDown') return t('enemyDown', { enemy });
    if (entry.type === 'guard') return t('guardLog', { hero, amount: entry.amount });
    if (entry.type === 'fortify') return t('fortifyLog', { amount: entry.amount });
    if (entry.type === 'thorns') return t('thornsLog');
    if (entry.type === 'shatter') return t('shatterLog');
    if (entry.type === 'resonance') return t('resonanceLog');
    if (entry.type === 'swap') return t('swapLog');
    if (entry.type === 'mend') return t('mendLog', { hero, amount: entry.amount });
    if (entry.type === 'move') return t('moveLog', { hero });
    if (entry.type === 'vault') return t('vaultLog', { hero });
    if (entry.type === 'reshuffle') return t('reshuffle');
    if (entry.type === 'turn') return t('turnLog', { turn: entry.turn });
    if (entry.type === 'bossPhase') return t('bossPhaseLog');
    if (entry.type === 'bossStart') return t('bossStart');
    if (entry.type === 'combatStart') return t('combatStart');
    if (entry.type === 'push') return t('pushLog', { enemy });
    if (entry.type === 'enemyHeal') return t('enemyHealLog', { enemy, amount: entry.amount });
    if (entry.type === 'edge' && entry.isolated) return t('edgeLog');
    return t('emptyLog');
  }
  function renderCard(instance) {
    const card = E.cardInfo(state, instance.id);
    const actor = E.heroById(state, card.hero);
    const description = cardText(instance.id)[1].replaceAll('{value}', card.value).replaceAll('{range}', card.range);
    const disabled = state.combat.energy < card.cost || !actor || actor.hp <= 0;
    return `<button class="card hero-${card.hero} ${selectedCard === instance.uid ? 'selected' : ''}" data-action="card" data-uid="${instance.uid}" ${disabled ? 'disabled' : ''} aria-pressed="${selectedCard === instance.uid}"><span class="card-cost">${card.cost}</span><span class="card-hero">${esc(heroName(card.hero))}</span><span class="card-art">${iconSvg(instance.id)}</span><span class="card-name">${esc(cardName(instance.id))}</span><span class="card-target">${esc(t('range'))} ${card.range || '—'} · ${esc(targetLabel(card))}</span><span class="card-description">${esc(description)}</span>${card.level ? `<span class="card-level" title="${esc(t('upgraded'))}">${'<i></i>'.repeat(card.level)}</span>` : ''}</button>`;
  }
  function describePending() {
    if (!pending) return '';
    const lines = [];
    if (pending.kind === 'move') {
      lines.push(t('incomingChange', { before: pending.incomingBefore, after: pending.incomingAfter }));
    } else {
      const instance = state.combat.hand.find(card => card.uid === pending.uid);
      if (instance) lines.push(`${cardName(instance.id)} · ${t('energyPreview', { before: state.combat.energy, after: pending.changes.energyAfter })}`);
      if (pending.isolated) lines.push(t('isolated'));
      if (instance && instance.id === 'shatter') lines.push(t('crystalRemoved'));
    }
    pending.changes.heroes.forEach(change => {
      const parts = [];
      if (change.hpBefore !== change.hpAfter) parts.push(`${t('hp')} ${change.hpBefore} → ${change.hpAfter}`);
      if (change.guardBefore !== change.guardAfter) parts.push(`${t('guard')} ${change.guardBefore} → ${change.guardAfter}`);
      if (change.from.x !== change.to.x || change.from.y !== change.to.y) parts.push(`${coord(change.from)} → ${coord(change.to)}`);
      if (parts.length) lines.push(`${heroName(change.id)}: ${parts.join(' · ')}`);
    });
    pending.changes.enemies.forEach(change => {
      const enemy = E.enemyById(state, change.id);
      const parts = [];
      if (change.hpBefore !== change.hpAfter) parts.push(`${t('hp')} ${change.hpBefore} → ${change.hpAfter}`);
      if (change.from.x !== change.to.x || change.from.y !== change.to.y) parts.push(`${coord(change.from)} → ${coord(change.to)}`);
      if (parts.length) lines.push(`${enemy ? enemyName(enemy.type) : change.id}: ${parts.join(' · ')}`);
    });
    return lines.join('  |  ') || t('noChange');
  }
  function renderPreview() {
    if (!pending) return '';
    return `<div class="preview-panel" role="status" aria-live="polite" aria-atomic="true"><h3 class="preview-title">${esc(t(pending.kind === 'move' ? 'previewMove' : 'previewCard'))}</h3><div class="preview-text">${esc(describePending())}</div></div>`;
  }
  function renderCombatControls() {
    return `<div class="combat-controls ${pending ? 'has-preview' : ''}">${renderPreview()}<div class="combat-actions">${pending ? `<button class="secondary-button cancel-button" data-action="cancel">${esc(t('cancel'))}</button><button class="primary-button confirm-button" data-action="confirm">${esc(t('confirm'))}</button>` : ''}<button class="end-turn" data-action="end-turn">${esc(t('endTurn'))}<small>${esc(t('endHint'))}</small></button></div></div>`;
  }
  function renderCombat() {
    const combat = state.combat;
    const layoutName = NODE_TEXT.layouts[lang][combat.layout] || NODE_TEXT.layouts.en[combat.layout];
    return `<main class="screen game-layout"><section class="battle-main"><div class="battle-heading"><div><h1>${esc(nodeName(state.currentNode))}</h1><p>${esc(layoutName)} · ${combat.final ? esc(t('final')) : esc(t('combat'))}</p></div><span class="turn-chip">${esc(t('turn'))} ${combat.turn}</span>${combat.final ? `<div class="boss-phase">${esc(t(combat.bossPhase === 2 ? 'bossPhaseLog' : 'helpBoss'))}</div>` : ''}</div><div class="battle-status"><div class="energy-meter"><span class="energy-label">${esc(t('energy'))}</span>${[0, 1, 2].map(index => `<span class="energy-orb ${index < combat.energy ? '' : 'empty'}">${index < combat.energy ? '◆' : ''}</span>`).join('')}</div><span class="pile-count">${esc(t('draw'))} <strong>${combat.deck.length}</strong></span><span class="pile-count">${esc(t('discard'))} <strong>${combat.discard.length}</strong></span><span class="team-mini">${state.heroes.map(hero => `<span class="team-mini-dot ${hero.hp <= 0 ? 'downed' : ''}"></span>`).join('')}</span></div>${renderBoard()}${renderCombatControls()}<section class="hand-zone"><div class="hand-heading"><h2>${esc(t('hand'))}</h2><span>${esc(t('handHelp'))}</span></div><div class="hand">${combat.hand.length ? combat.hand.map(renderCard).join('') : `<div class="empty-hand">${esc(t('emptyHand'))}</div>`}</div></section></section>${renderSidebar()}</main>`;
  }
  function renderModal() {
    if (!modal) { modalRoot.innerHTML = ''; return; }
    let title = t('helpTitle');
    let body = '';
    if (modal.type === 'help') {
      body = `<p>${esc(t('helpGoal'))}</p><h3>${esc(t('turn'))}</h3><p>${esc(t('helpTurn'))}</p><h3>${esc(t('hand'))}</h3><p>${esc(t('helpCards'))}</p><h3>${esc(t('intents'))}</h3><p>${esc(t('helpIntent'))}</p><div class="rule-grid"><div class="rule-item"><strong>${esc(t('helpElements').split('.')[0])}</strong>${esc(t('helpElements'))}</div><div class="rule-item"><strong>${esc(t('final'))}</strong>${esc(t('helpBoss'))}</div></div><h3>${esc(t('helpControls').split('.')[0])}</h3><p>${esc(t('helpControls'))}</p>`;
    } else if (modal.type === 'enemy') {
      const enemy = E.enemyById(state, modal.id);
      if (!enemy) { modalRoot.innerHTML = ''; return; }
      const intent = state.combat.intents.find(item => item.enemyId === enemy.id);
      title = enemyName(enemy.type);
      const behaviorKey = { hound: 'behaviorHound', sentry: 'behaviorSentry', ram: 'behaviorRam', weaver: 'behaviorWeaver', boss: 'behaviorBoss' }[enemy.type];
      body = `<p>${enemy.hp}/${enemy.maxHp} ${esc(t('hp'))} · ${coord(enemy)}</p><p>${esc(t(behaviorKey))}</p><div class="intent-detail"><strong>${esc(t('intents'))}</strong><br>${esc(describeIntent(intent))}</div><p>${esc(t('helpIntent'))}</p>`;
    } else {
      title = t('targetCrystal');
      body = `<p>${esc(t('helpElements'))}</p><p>${esc(cardText('shatter')[1].replaceAll('{value}', E.cardInfo(state, 'shatter').value))}</p><p>${esc(cardText('resonance')[1].replaceAll('{value}', E.cardInfo(state, 'resonance').value))}</p>`;
    }
    modalRoot.innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" data-modal-panel><div class="modal-header"><h2>${esc(title)}</h2><button class="icon-button" data-action="close-modal" aria-label="${esc(t('close'))}">×</button></div><div class="modal-body">${body}</div></section></div>`;
  }
  function render() {
    document.documentElement.lang = lang;
    document.title = t('title');
    const content = view === 'home' ? renderHome() : state.screen === 'map' ? renderMap() : state.screen === 'combat' ? renderCombat() : state.screen === 'reward' ? renderReward() : state.screen === 'rest' ? renderRest() : state.screen === 'event' ? renderEvent() : renderEnding();
    app.innerHTML = `<div class="app-shell">${renderTopbar()}${content}</div>${autoplay && view === 'game' ? `<button class="autoplay-banner" data-action="stop-autoplay">${esc(t('autoplay'))} · ${esc(t('stopAutoplay'))}</button>` : ''}`;
    renderModal();
    scheduleAutoplay();
  }

  function clearSelection() {
    selectedHero = null;
    selectedCard = null;
    selectedTargets = [];
    pending = null;
  }
  function afterAction(result) {
    if (!result || !result.ok) {
      toast(result && result.error ? result.error : t('noTargets'));
      render();
      return false;
    }
    clearSelection();
    saveGame();
    if (state.screen === 'ending') playSound(state.ending && state.ending.victory ? 'victory' : 'hit');
    else if (result.cardId === 'safeguard' || result.cardId === 'fortify') playSound('guard');
    else playSound('hit');
    render();
    return true;
  }
  function startNew(seed) {
    clearSelection();
    modal = null;
    state = E.createExpedition(seed || requestedSeed || randomSeed());
    savedState = E.clone(state);
    view = 'game';
    saveGame();
    render();
  }
  function stopAutoplay() {
    autoplay = false;
    clearTimeout(autoTimer);
    autoTimer = null;
  }
  function scheduleAutoplay() {
    if (!autoplay || view !== 'game' || !state || state.screen === 'ending' || autoTimer || autoBusy) return;
    autoTimer = setTimeout(() => {
      autoTimer = null;
      if (!autoplay || view !== 'game') return;
      const action = E.autoAction(state);
      if (!action) return;
      const result = E.applyAction(state, action);
      afterAction(result);
    }, 620);
  }
  function sameTarget(a, b) {
    return a.kind === b.kind && a.id === b.id && a.x === b.x && a.y === b.y;
  }
  function chooseCardTarget(target) {
    const legal = E.getCardTargets(state, selectedCard, selectedTargets);
    const match = legal.find(item => sameTarget(item, target));
    if (!match) return false;
    selectedTargets.push(match);
    const instance = state.combat.hand.find(card => card.uid === selectedCard);
    if (!instance) { clearSelection(); return false; }
    const required = E.CARDS[instance.id].target === 'twoHeroes' ? 2 : 1;
    if (selectedTargets.length < required) { render(); return true; }
    const preview = E.previewCard(state, selectedCard, selectedTargets);
    if (!preview.ok) { toast(preview.error); clearSelection(); render(); return false; }
    pending = preview;
    render();
    return true;
  }
  function showHelp() { modal = { type: 'help' }; render(); }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'close-modal' && event.target.closest('[data-modal-panel]') && !event.target.closest('button[data-action="close-modal"]')) return;
    if (['node', 'card', 'hero', 'cell', 'confirm', 'end-turn', 'reward', 'rest', 'event'].includes(action) && autoplay) stopAutoplay();
    if (action === 'language') {
      lang = button.dataset.lang;
      savePreferences();
      render();
    } else if (action === 'sound') {
      preferences.sound = !preferences.sound;
      savePreferences();
      if (preferences.sound) playSound('guard');
      render();
    } else if (action === 'help') showHelp();
    else if (action === 'close-modal') { modal = null; render(); }
    else if (action === 'home') {
      if (state && view === 'game') saveGame();
      stopAutoplay();
      savedState = state ? E.clone(state) : readSave();
      view = 'home';
      clearSelection();
      modal = null;
      render();
    } else if (action === 'new-game') { stopAutoplay(); startNew(); }
    else if (action === 'continue' && savedState) {
      stopAutoplay();
      state = E.clone(savedState);
      view = 'game';
      clearSelection();
      render();
    } else if (action === 'watch') {
      stopAutoplay();
      autoplay = true;
      startNew('first-light');
    } else if (action === 'stop-autoplay') { stopAutoplay(); render(); }
    else if (action === 'retry') { stopAutoplay(); startNew(state.seed); }
    else if (action === 'node') {
      clearSelection();
      afterAction(E.startNode(state, button.dataset.id));
    } else if (action === 'card') {
      pending = null;
      selectedTargets = [];
      selectedHero = null;
      selectedCard = selectedCard === button.dataset.uid ? null : button.dataset.uid;
      if (selectedCard && !E.getCardTargets(state, selectedCard).length) toast(t('noTargets'));
      render();
    } else if (action === 'hero') {
      if (selectedCard && chooseCardTarget({ kind: 'hero', id: button.dataset.id })) return;
      clearSelection();
      selectedHero = button.dataset.id;
      if (!E.getMoveTargets(state, selectedHero).length) toast(t('noTargets'));
      render();
    } else if (action === 'cell') {
      const x = Number(button.dataset.x);
      const y = Number(button.dataset.y);
      if (selectedCard) {
        const target = currentLegalTargets().find(item => targetAtCell(item, x, y));
        if (target) { chooseCardTarget(target); return; }
      }
      if (selectedHero) {
        const target = currentLegalTargets().find(item => item.kind === 'cell' && item.x === x && item.y === y);
        if (target) {
          pending = E.previewMove(state, selectedHero, target);
          render();
          return;
        }
      }
      const hero = state.heroes.find(item => item.hp > 0 && item.x === x && item.y === y);
      const enemy = E.aliveEnemies(state).find(item => item.x === x && item.y === y);
      const crystal = E.crystalAt(state, x, y);
      clearSelection();
      if (hero) selectedHero = hero.id;
      else if (enemy) modal = { type: 'enemy', id: enemy.id };
      else if (crystal) modal = { type: 'crystal' };
      render();
    } else if (action === 'enemy-info') {
      clearSelection();
      modal = { type: 'enemy', id: button.dataset.id };
      render();
    } else if (action === 'cancel') { clearSelection(); render(); }
    else if (action === 'confirm' && pending) {
      const result = pending.kind === 'move' ? E.moveHero(state, pending.heroId, pending.target) : E.playCard(state, pending.uid, pending.targets);
      afterAction(result);
    } else if (action === 'end-turn') { clearSelection(); afterAction(E.endTurn(state)); }
    else if (action === 'reward') afterAction(E.chooseReward(state, button.dataset.id));
    else if (action === 'rest') afterAction(E.chooseRest(state, button.dataset.id));
    else if (action === 'event') afterAction(E.chooseEvent(state, button.dataset.id));
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (modal) modal = null;
      else clearSelection();
      render();
      return;
    }
    if (event.key.toLowerCase() === 'm' && !event.ctrlKey && !event.metaKey) {
      preferences.sound = !preferences.sound;
      savePreferences();
      render();
      return;
    }
    const cell = event.target.closest && event.target.closest('.cell[role=button]');
    if (cell && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      cell.click();
      return;
    }
    if (event.code === 'Space' && view === 'game' && state && state.screen === 'combat' && !modal && !event.target.closest('button')) {
      event.preventDefault();
      stopAutoplay();
      clearSelection();
      afterAction(E.endTurn(state));
    }
  });

  savedState = readSave();
  if (autoplay) {
    state = E.createExpedition(requestedSeed || 'first-light');
    view = 'game';
    saveGame();
  }
  render();
})();
