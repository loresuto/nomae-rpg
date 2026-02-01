// Game State
const state = {
    player: {
        name: "Unknown",
        hp: 10,
        maxHp: 10,
        strength: 0,
        agility: 0,
        charisma: 0,
        gold: 100,
        inventory: [],
        weapon: null,
        armor: null,
        isDefending: false
    },
    location: 'INTRO', // INTRO, NAMING, CHARGEN, ARMORY, DUNGEON, DEAD
    dungeon: {
        x: 0,
        y: 0,
        lastX: null,  // Track previous position for fleeing
        lastY: null,
        width: 8,
        height: 8,
        rooms: {}
    }
};

// Audio Engine - Lazy initialization to comply with browser autoplay policies
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playBeep() {
    playSound(800, 0.1, 'square');
}

function playHit() {
    playSound(200, 0.15, 'sawtooth');
}

function playMiss() {
    playSound(150, 0.1, 'sine');
}

function playTreasure() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    // Play ascending notes
    [523, 659, 784].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.1, 'square'), i * 80);
    });
}

function playDeath() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    // Descending sad tones
    [400, 300, 200, 100].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.2, 'sawtooth'), i * 150);
    });
}

function playVictory() {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    // Victory fanfare
    [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.15, 'square'), i * 100);
    });
}

function playSound(frequency, duration, waveType = 'square') {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
        ctx.resume();
    }
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
}

// UI Helpers
const monitor = document.getElementById('screen-content');
const btnRow1 = document.getElementById('button-row-1');
const btnRow2 = document.getElementById('button-row-2');
const cmdInput = document.getElementById('command-input');

function print(text, clear = false) {
    if (clear) monitor.textContent = '';
    monitor.textContent += text + '\n';
    const monitorDiv = document.getElementById('monitor');
    monitorDiv.scrollTop = monitorDiv.scrollHeight;
}

// Centering helpers - calculate padding mathematically
function getMaxLineWidth(text) {
    const lines = text.split('\n');
    return Math.max(...lines.map(line => line.length));
}

function centerText(text, targetWidth) {
    const textWidth = text.length;
    const padding = Math.floor((targetWidth - textWidth) / 2);
    return ' '.repeat(Math.max(0, padding)) + text;
}

function centerBlock(asciiArt, targetWidth) {
    const lines = asciiArt.split('\n');
    // Find the widest line in the ASCII art
    const blockWidth = Math.max(...lines.map(line => line.length));
    // Calculate padding based on the block's width, not individual lines
    const padding = Math.floor((targetWidth - blockWidth) / 2);
    const paddingStr = ' '.repeat(Math.max(0, padding));
    // Apply the SAME padding to ALL lines to preserve the shape
    return lines.map(line => paddingStr + line).join('\n');
}

function clearButtons() {
    btnRow1.innerHTML = '';
    btnRow2.innerHTML = '';
}

function addButton(label, action, row = 1) {
    const btn = document.createElement('button');
    btn.className = 'cmd-btn';
    btn.textContent = `[ ${label} ]`;
    btn.onclick = () => {
        playBeep();
        action();
        cmdInput.focus();
    };

    if (row === 1) btnRow1.appendChild(btn);
    else btnRow2.appendChild(btn);
}

// Game Logic - Scenes

function startIntro() {
    state.location = 'INTRO';
    document.getElementById('monitor').classList.add('centered-view');
    print("", true); // Clear screen

    // Calculate the reference width from the widest element (LOGO)
    const referenceWidth = getMaxLineWidth(ASSETS.LOGO);

    // Print everything centered to the same width
    print(ASSETS.LOGO);
    print(centerBlock(ASSETS.DRAGON, referenceWidth));
    print(centerText("A Retro RPG Adventure", referenceWidth));
    print(centerText("(C) 2026 Sir Slothkins", referenceWidth));
    print("");
    print(centerText("Press START to begin...", referenceWidth));

    clearButtons();
    addButton("START", startNaming);
}

function startNaming() {
    state.location = 'NAMING';
    print("\nWhat is your name, adventurer?");
    print("(Type your name and press ENTER)");
    clearButtons();
}

function setPlayerName(name) {
    if (name.length > 0) {
        state.player.name = name;
        print(`\nGreetings, ${name}!`);
        startCharGen();
    } else {
        print("\nPlease enter a valid name.");
    }
}

function startCharGen() {
    state.location = 'CHARGEN';
    document.getElementById('monitor').classList.remove('centered-view'); // Reset parent
    print(ASSETS.DICE, true);
    print("\nCHARACTER CREATION");

    // Roll Stats
    state.player.strength = Math.floor(Math.random() * 6) + 12; // 12-18
    state.player.agility = Math.floor(Math.random() * 6) + 12;
    state.player.charisma = Math.floor(Math.random() * 6) + 12;

    // Calculate HP based on strength
    state.player.maxHp = 10 + Math.floor((state.player.strength - 10) / 2);
    state.player.hp = state.player.maxHp;

    print(`\nHP:       ${state.player.hp}/${state.player.maxHp}`);
    print(`STRENGTH: ${state.player.strength}`);
    print(`AGILITY:  ${state.player.agility}`);
    print(`CHARISMA: ${state.player.charisma}`);

    print(`\nAre you satisfied with these stats, ${state.player.name}?`);

    clearButtons();
    addButton("YES", enterArmory);
    addButton("REROLL", startCharGen);
}

function enterArmory() {
    state.location = 'ARMORY';
    print(ASSETS.STAN, true);
    print("\nSTAN'S ARMORY");
    print(`\n"WELL WELL, ${state.player.name.toUpperCase()}! LOOKING TO GET EQUIPPED?"`);
    print(`\nGOLD: ${state.player.gold}`);
    print("\nWARES FOR SALE:");
    print("1. SWORD (50g)");
    print("2. MACE  (30g)");
    print("3. AXE   (40g)");
    print("4. LEATHER ARMOR (60g)");
    print("5. HEALING POTION (25g)");

    clearButtons();
    addButton("BUY SWORD", () => buyItem('Sword', 50));
    addButton("BUY MACE", () => buyItem('Mace', 30));
    addButton("BUY AXE", () => buyItem('Axe', 40));
    addButton("BUY ARMOR", () => buyItem('Leather Armor', 60));
    addButton("BUY POTION", () => buyItem('Healing Potion', 25), 2);
    addButton("EXIT TO DUNGEON", enterDungeon, 2);
}

function buyItem(name, cost) {
    if (state.player.gold >= cost) {
        state.player.gold -= cost;
        state.player.inventory.push(name);
        print(`\nSTAN SAYS: "WISE CHOICE, ${state.player.name.toUpperCase()}!"`);
        print(`You bought a ${name}!`);
        print(`GOLD REMAINING: ${state.player.gold}`);
    } else {
        print(`\nSTAN SAYS: "NOT ENOUGH GOLD, ${state.player.name.toUpperCase()}! COME BACK WHEN YOU'RE RICHER!"`);
    }
}

function returnToArmory() {
    state.location = 'ARMORY';
    print(ASSETS.STAN, true);
    print("\nSTAN'S ARMORY");
    print(`\n"BACK ALREADY, ${state.player.name.toUpperCase()}? NEED MORE GEAR?"`);
    print(`\nGOLD: ${state.player.gold}`);
    print(`HP: ${state.player.hp}/${state.player.maxHp}`);
    print("\nWARES FOR SALE:");
    print("1. SWORD (50g)");
    print("2. MACE  (30g)");
    print("3. AXE   (40g)");
    print("4. LEATHER ARMOR (60g)");
    print("5. HEALING POTION (25g)");

    clearButtons();
    addButton("BUY SWORD", () => buyItem('Sword', 50));
    addButton("BUY MACE", () => buyItem('Mace', 30));
    addButton("BUY AXE", () => buyItem('Axe', 40));
    addButton("BUY ARMOR", () => buyItem('Leather Armor', 60));
    addButton("BUY POTION", () => buyItem('Healing Potion', 25), 2);
    addButton("RETURN TO DUNGEON", returnToDungeon, 2);
}

function returnToDungeon() {
    state.location = 'DUNGEON';
    print("", true);
    print(`${state.player.name} returns to the dungeon entrance...`);
    state.dungeon.x = 0;
    state.dungeon.y = 0;
    lookRoom();
}

function enterDungeon() {
    state.location = 'DUNGEON';
    print("", true);
    print(`Brave ${state.player.name} descends into the dungeon...`);
    print("May fortune favor you!\n");
    generateDungeon();
    lookRoom();
}

function generateDungeon() {
    state.dungeon.rooms = {};
    for (let x = 0; x < state.dungeon.width; x++) {
        for (let y = 0; y < state.dungeon.height; y++) {
            const room = {
                type: 'EMPTY',
                art: null,
                name: null,
                visited: false
            };

            // Random Encounter Chance
            if (Math.random() > 0.3) { // 70% chance of something
                const isMonster = Math.random() > 0.4;
                if (isMonster) {
                    const types = ['SLIME', 'SKELETON', 'RAT', 'GOBLIN'];
                    const type = types[Math.floor(Math.random() * types.length)];
                    room.type = 'MONSTER';
                    room.name = type;
                    // Pick random art variant
                    const variants = ASSETS.MONSTERS[type];
                    room.art = variants[Math.floor(Math.random() * variants.length)];

                    room.hp = Math.floor(Math.random() * 10) + 5;
                    room.maxHp = room.hp;
                    room.damage = Math.floor(Math.random() * 4) + 2;
                } else {
                    const variants = ASSETS.TREASURE;
                    room.type = 'TREASURE';
                    room.art = variants[Math.floor(Math.random() * variants.length)];
                    room.goldAmount = Math.floor(Math.random() * 30) + 10; // 10-40 gold
                }
            }
            state.dungeon.rooms[`${x},${y}`] = room;
        }
    }

    // Start room - Portal entrance
    state.dungeon.rooms[`0,0`] = {
        type: 'PORTAL',
        art: ASSETS.PORTAL,
        name: 'Dungeon Entrance',
        visited: true
    };

    // Boss room - far corner (7,7)
    const bossX = state.dungeon.width - 1;
    const bossY = state.dungeon.height - 1;
    state.dungeon.rooms[`${bossX},${bossY}`] = {
        type: 'BOSS',
        art: ASSETS.BOSS,
        name: 'ANCIENT DRAGON',
        hp: 50,
        maxHp: 50,
        damage: 8,
        visited: false
    };
}

function lookRoom() {
    if (state.location === 'DEAD') return; // Dead players can't look

    print("", true);

    const key = `${state.dungeon.x},${state.dungeon.y}`;
    const io = state.dungeon.rooms[key];
    if (io) io.visited = true;

    if (!io) {
        // Fallback should not happen with pre-gen
        print("Error: You are in the void.");
        return;
    }

    const currentRoom = io;

    if (currentRoom.type === 'BOSS') {
        print(currentRoom.art);
        print(`\n*** THE ${currentRoom.name} AWAITS! ***`);
        print("This is the final challenge!");
        print(`HP: ${currentRoom.hp}/${currentRoom.maxHp}`);
    } else if (currentRoom.type === 'MONSTER') {
        print(currentRoom.art);
        print(`\nA WILD ${currentRoom.name} APPEARS!`);
        print(`It snarls at ${state.player.name}!`);
        print(`HP: ${currentRoom.hp}/${currentRoom.maxHp}`);
    } else if (currentRoom.type === 'TREASURE') {
        print(currentRoom.art);
        print("\nYOU FOUND SOME TREASURE!");
        print(`It looks like about ${currentRoom.goldAmount} gold!`);
    } else if (currentRoom.type === 'CORPSE') {
        print(currentRoom.art);
        print(`\nThe dead body of a ${currentRoom.name} lies here.`);
    } else if (currentRoom.type === 'LOOTED') {
        print("\nAn empty chest sits here, already looted.");
    } else if (currentRoom.type === 'PORTAL') {
        print(currentRoom.art);
        print("\nYou stand at the dungeon entrance.");
        print("A shimmering portal leads back to Stan's Armory.");
        print("Deeper in the dungeon, a powerful foe awaits...");
    } else if (currentRoom.type === 'VICTORY') {
        // Victory state - handled separately
        return;
    } else {
        // Atmospheric empty room descriptions
        const descriptions = [
            "The room is empty and quiet.",
            "Shadows dance on the cold stone walls.",
            "Dripping water echoes in the darkness.",
            "Ancient runes are carved into the floor.",
            "A faint breeze carries the smell of decay.",
            "Cobwebs hang from the ceiling.",
            "Rat bones crunch beneath your feet."
        ];
        print(`\n${descriptions[Math.floor(Math.random() * descriptions.length)]}`);
    }

    print(`\nLOCATION: ${state.dungeon.x}, ${state.dungeon.y}`);
    print("You are in a dark maze.");

    // Exits calculation
    const exits = [];
    if (state.dungeon.y < state.dungeon.height - 1) exits.push("N");
    if (state.dungeon.y > 0) exits.push("S");
    if (state.dungeon.x < state.dungeon.width - 1) exits.push("E");
    if (state.dungeon.x > 0) exits.push("W");

    print(`EXITS: ${exits.join(', ')}`);

    setupDungeonControls(exits);
}

function setupDungeonControls(exits) {
    clearButtons();

    const key = `${state.dungeon.x},${state.dungeon.y}`;
    const room = state.dungeon.rooms[key];

    if (room && (room.type === 'MONSTER' || room.type === 'BOSS')) {
        // Combat Menu - Takes priority for both regular monsters and boss
        addButton("ATTACK", attackEnemy, 1);
        addButton("DEFEND", defendSelf, 1);
        addButton("FLEE", fleeCombat, 1);
        addButton("USE POTION", usePotion, 2);
    } else if (room && room.type === 'TREASURE') {
        // Treasure room - show pickup option
        if (exits.includes("N")) addButton("N", () => move(0, 1));
        if (exits.includes("S")) addButton("S", () => move(0, -1));
        if (exits.includes("E")) addButton("E", () => move(1, 0));
        if (exits.includes("W")) addButton("W", () => move(-1, 0));
        addButton("TAKE", collectTreasure, 2);
        addButton("STATUS", showStatus, 2);
        addButton("MAP", showMap, 2);
    } else if (room && room.type === 'PORTAL') {
        // Portal room - can return to armory
        if (exits.includes("N")) addButton("N", () => move(0, 1));
        if (exits.includes("S")) addButton("S", () => move(0, -1));
        if (exits.includes("E")) addButton("E", () => move(1, 0));
        if (exits.includes("W")) addButton("W", () => move(-1, 0));
        addButton("ARMORY", returnToArmory, 2);
        addButton("STATUS", showStatus, 2);
        addButton("MAP", showMap, 2);
    } else {
        // Normal navigation
        if (exits.includes("N")) addButton("N", () => move(0, 1));
        if (exits.includes("S")) addButton("S", () => move(0, -1));
        if (exits.includes("E")) addButton("E", () => move(1, 0));
        if (exits.includes("W")) addButton("W", () => move(-1, 0));
        addButton("LOOK", lookRoom, 2);
        addButton("STATUS", showStatus, 2);
        addButton("MAP", showMap, 2);
        addButton("USE POTION", usePotion, 2);
    }
}

function collectTreasure() {
    if (state.location === 'DEAD') return;

    const key = `${state.dungeon.x},${state.dungeon.y}`;
    const room = state.dungeon.rooms[key];

    if (!room || room.type !== 'TREASURE') {
        print("\nThere's no treasure here to collect!");
        return;
    }

    const goldFound = room.goldAmount;
    state.player.gold += goldFound;

    // Small HP bonus for finding treasure (excitement heals!)
    const hpBonus = Math.floor(Math.random() * 3) + 1;
    state.player.hp = Math.min(state.player.hp + hpBonus, state.player.maxHp);

    playTreasure();
    print(`\n${state.player.name} collects ${goldFound} GOLD!`);
    print(`The thrill of treasure heals you for ${hpBonus} HP!`);
    print(`TOTAL GOLD: ${state.player.gold}`);

    // Mark room as looted
    room.type = 'LOOTED';
    room.art = null;

    lookRoom();
}

function usePotion() {
    if (state.location === 'DEAD') return;

    const potionIndex = state.player.inventory.findIndex(i => i === 'Healing Potion');
    if (potionIndex === -1) {
        print("\nYou don't have any healing potions!");
        return;
    }

    // Remove potion from inventory
    state.player.inventory.splice(potionIndex, 1);

    // Heal 5-10 HP
    const healAmount = Math.floor(Math.random() * 6) + 5;
    const oldHp = state.player.hp;
    state.player.hp = Math.min(state.player.hp + healAmount, state.player.maxHp);
    const actualHeal = state.player.hp - oldHp;

    print(`\n${state.player.name} drinks a Healing Potion!`);
    print(`Restored ${actualHeal} HP. (HP: ${state.player.hp}/${state.player.maxHp})`);
}

function defendSelf() {
    if (state.location === 'DEAD') return;

    state.player.isDefending = true;
    print(`\n${state.player.name} assumes a defensive stance!`);
    resolveMonsterTurn(true);
}

function fleeCombat() {
    if (state.location === 'DEAD') return;

    state.player.isDefending = false;

    // Check if we have a previous position to flee to
    const hasLastPos = state.dungeon.lastX !== null && state.dungeon.lastY !== null;

    if (!hasLastPos) {
        // First room or no history - calculate valid retreat directions
        const validDirs = [];
        if (state.dungeon.y < state.dungeon.height - 1) validDirs.push([0, 1]);
        if (state.dungeon.y > 0) validDirs.push([0, -1]);
        if (state.dungeon.x < state.dungeon.width - 1) validDirs.push([1, 0]);
        if (state.dungeon.x > 0) validDirs.push([-1, 0]);

        if (validDirs.length === 0) {
            print("\nThere's nowhere to flee!");
            resolveMonsterTurn(false);
            return;
        }

        // Agility check to flee
        const fleeChance = 0.5 + (state.player.agility - 10) * 0.05;
        if (Math.random() < fleeChance) {
            print(`\n${state.player.name} panics and runs!`);
            const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
            move(dir[0], dir[1]);
        } else {
            print("\nESCAPE FAILED! The enemy corners you.");
            resolveMonsterTurn(false);
        }
        return;
    }

    // Agility check to flee
    const fleeChance = 0.5 + (state.player.agility - 10) * 0.05;
    if (Math.random() < fleeChance) {
        print(`\n${state.player.name} retreats to the previous room!`);
        // Retreat to the previous position
        const retreatX = state.dungeon.lastX;
        const retreatY = state.dungeon.lastY;

        // Don't track this as a "movement" to avoid flee loops
        state.dungeon.lastX = null;
        state.dungeon.lastY = null;
        state.dungeon.x = retreatX;
        state.dungeon.y = retreatY;

        lookRoom();
    } else {
        print("\nESCAPE FAILED! The enemy blocks your retreat.");
        resolveMonsterTurn(false);
    }
}

function resolveMonsterTurn(playerDefending) {
    if (state.location === 'DEAD') return;

    const key = `${state.dungeon.x},${state.dungeon.y}`;
    const room = state.dungeon.rooms[key];

    if (!room || (room.type !== 'MONSTER' && room.type !== 'BOSS')) return;

    print(`The ${room.name} attacks!`);

    // Hit Chance
    let hitThreshold = 0.5;
    if (playerDefending) hitThreshold = 0.25;

    if (Math.random() < hitThreshold) {
        let mDmg = room.damage;
        if (state.player.inventory.some(i => i.includes('Armor'))) mDmg = Math.max(0, mDmg - 2);
        if (playerDefending) mDmg = Math.floor(mDmg / 2);

        state.player.hp -= mDmg;
        playHit();
        print(`It hits you for ${mDmg} damage!`);
    } else {
        playMiss();
        print(`The ${room.name} misses you!`);
    }

    checkPlayerDeath();
    state.player.isDefending = false;

    if (state.location !== 'DEAD') {
        printStatusShort(room);
    }
}

function printStatusShort(room) {
    print(`\nYOUR HP: ${state.player.hp}/${state.player.maxHp}`);
    print(`ENEMY HP: ${room.hp}/${room.maxHp}`);
}

function showVictoryScreen() {
    state.location = 'VICTORY';
    document.getElementById('monitor').classList.add('centered-view');
    print("", true);

    // Use the same centering as intro
    const referenceWidth = getMaxLineWidth(ASSETS.VICTORY);

    print(ASSETS.VICTORY);
    print("");
    print(centerText("*** VICTORY! ***", referenceWidth));
    print("");
    print(centerText(`${state.player.name} has slain the ANCIENT DRAGON!`, referenceWidth));
    print(centerText("The dungeon is saved!", referenceWidth));
    print("");
    print(centerText(`Final Gold: ${state.player.gold}`, referenceWidth));
    print(centerText(`Final HP: ${state.player.hp}/${state.player.maxHp}`, referenceWidth));
    print("");
    print(centerText("You are a true CHAMPION!", referenceWidth));

    // Play a longer victory fanfare
    [523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.2, 'square'), i * 120);
    });

    clearButtons();
    addButton("PLAY AGAIN", () => location.reload());
}

function checkPlayerDeath() {
    if (state.player.hp <= 0) {
        state.player.hp = 0;
        playDeath();
        print(`\n*** ${state.player.name.toUpperCase()} HAS FALLEN ***`);
        print("Your quest ends here, brave adventurer.");
        print("The dungeon claims another soul...");
        state.location = 'DEAD';
        clearButtons();
        addButton("RESTART", () => location.reload());
    }
}

function attackEnemy() {
    if (state.location === 'DEAD') return;

    state.player.isDefending = false;
    const key = `${state.dungeon.x},${state.dungeon.y}`;
    const room = state.dungeon.rooms[key];

    if (!room || (room.type !== 'MONSTER' && room.type !== 'BOSS')) {
        print("\nThere is nothing here to attack!");
        return;
    }

    // Player Attack
    let hitChance = 0.5 + (state.player.agility - 10) * 0.05; // Base 50% + AGI bonus
    if (Math.random() < hitChance) {
        let dmg = Math.floor(state.player.strength / 3);
        if (state.player.inventory.some(i => i.includes('Sword'))) dmg += 4;
        else if (state.player.inventory.some(i => i.includes('Axe'))) dmg += 5;
        else if (state.player.inventory.some(i => i.includes('Mace'))) dmg += 3;
        else dmg += 1; // Fists

        room.hp -= dmg;
        print(`\nYou hit the ${room.name} for ${dmg} damage!`);
    } else {
        print(`\nYou missed the ${room.name}!`);
    }

    if (room.hp <= 0) {
        if (room.type === 'BOSS') {
            // VICTORY! Player has beaten the game!
            showVictoryScreen();
            return;
        }

        playVictory();
        print(`\nThe ${room.name} DIES!`);
        print(`${state.player.name} is victorious!`);
        room.type = 'CORPSE';
        room.art = ASSETS.CORPSE;
        state.player.gold += Math.floor(Math.random() * 20) + 10;
        print(`You found some gold on the body.`);
        // Reload room to update controls (remove attack)
        lookRoom();
        return;
    }

    resolveMonsterTurn(false);
}

function move(dx, dy) {
    if (state.location === 'DEAD') return;

    const newX = state.dungeon.x + dx;
    const newY = state.dungeon.y + dy;

    if (newX < 0 || newX >= state.dungeon.width || newY < 0 || newY >= state.dungeon.height) {
        print("\nYou hit a wall!");
        return;
    }

    // Track current position before moving (for flee mechanic)
    state.dungeon.lastX = state.dungeon.x;
    state.dungeon.lastY = state.dungeon.y;

    state.dungeon.x = newX;
    state.dungeon.y = newY;
    print(`\nYou move...`);
    lookRoom();
}

function showStatus() {
    if (state.location === 'DEAD') return;

    print(`\n--- STATUS FOR ${state.player.name.toUpperCase()} ---`);
    print(`HP: ${state.player.hp}/${state.player.maxHp}`);
    print(`STR: ${state.player.strength}  AGI: ${state.player.agility}  CHA: ${state.player.charisma}`);
    print(`GOLD: ${state.player.gold}`);

    // Show equipped items
    const weapon = state.player.inventory.find(i => i.includes('Sword') || i.includes('Axe') || i.includes('Mace'));
    const armor = state.player.inventory.find(i => i.includes('Armor'));
    const potions = state.player.inventory.filter(i => i.includes('Potion')).length;

    print(`\nEQUIPPED:`);
    print(`  WEAPON: ${weapon || 'Bare Fists'}`);
    print(`  ARMOR:  ${armor || 'None'}`);
    print(`  POTIONS: ${potions}`);
}

// Input Handling
cmdInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        playBeep();
        const cmd = cmdInput.value.trim().toUpperCase();
        cmdInput.value = '';
        processCommand(cmd);
    }
});

function processCommand(cmd) {
    if (state.location === 'DEAD') {
        if (cmd === 'RESTART') location.reload();
        return;
    }

    print(`\n] ${cmd}`);

    if (state.location === 'INTRO') {
        if (cmd === 'START') startNaming();
    } else if (state.location === 'NAMING') {
        setPlayerName(cmd);
    } else if (state.location === 'CHARGEN') {
        if (cmd === 'YES') enterArmory();
        if (cmd === 'REROLL') startCharGen();
    } else if (state.location === 'ARMORY') {
        if (cmd.startsWith('BUY SWORD')) buyItem('Sword', 50);
        else if (cmd.startsWith('BUY MACE')) buyItem('Mace', 30);
        else if (cmd.startsWith('BUY AXE')) buyItem('Axe', 40);
        else if (cmd.startsWith('BUY ARMOR')) buyItem('Leather Armor', 60);
        else if (cmd.startsWith('BUY POTION')) buyItem('Healing Potion', 25);
        else if (cmd === 'EXIT') enterDungeon();
    } else if (state.location === 'DUNGEON') {
        if (cmd === 'N' || cmd === 'NORTH') move(0, 1);
        else if (cmd === 'S' || cmd === 'SOUTH') move(0, -1);
        else if (cmd === 'E' || cmd === 'EAST') move(1, 0);
        else if (cmd === 'W' || cmd === 'WEST') move(-1, 0);
        else if (cmd === 'L' || cmd === 'LOOK') lookRoom();
        else if (cmd === 'ST' || cmd === 'STATUS') showStatus();
        else if (cmd === 'M' || cmd === 'MAP') showMap();
        else if (cmd === 'ATTACK' || cmd === 'A') attackEnemy();
        else if (cmd === 'DEFEND' || cmd === 'D') defendSelf();
        else if (cmd === 'FLEE' || cmd === 'F') fleeCombat();
        else if (cmd === 'TAKE' || cmd === 'T' || cmd === 'GET') collectTreasure();
        else if (cmd === 'USE POTION' || cmd === 'POTION' || cmd === 'P') usePotion();
    }
}

function showMap() {
    if (state.location === 'DEAD') return;

    print("\n--- DUNGEON MAP ---");
    const mapLines = [];
    // Render top down (Y max to 0)
    for (let y = state.dungeon.height - 1; y >= 0; y--) {
        let line = "";
        for (let x = 0; x < state.dungeon.width; x++) {
            if (x === state.dungeon.x && y === state.dungeon.y) {
                line += "[ @ ]";
            } else {
                const room = state.dungeon.rooms[`${x},${y}`];
                if (!room || !room.visited) {
                    line += "  .  "; // Fog of war
                } else {
                    if (room.type === 'BOSS') line += "[ D ]";  // Dragon
                    else if (room.type === 'MONSTER') line += "[ ! ]";
                    else if (room.type === 'TREASURE') line += "[ $ ]";
                    else if (room.type === 'CORPSE') line += "[ x ]";
                    else if (room.type === 'LOOTED') line += "[ o ]";
                    else if (room.type === 'PORTAL') line += "[ P ]";
                    else line += "[ # ]";
                }
            }
        }
        mapLines.push(line);
    }

    print(mapLines.join('\n'));
    print("Legend: @=You, D=BOSS, P=Portal, !=Enemy, $=Treasure, x=Corpse, o=Looted, #=Empty");
}

// Initialization
window.onload = () => {
    startIntro();
    cmdInput.focus();

    // Global click listener to ensure AudioContext is ready (browser policy)
    document.body.addEventListener('click', () => {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        cmdInput.focus();
    }, { once: true });
};
