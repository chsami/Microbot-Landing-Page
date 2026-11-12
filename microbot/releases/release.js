const releases = [
    {
        date: new Date('11/12/2026'), //MM/dd/YYYY
        version: '2.6.57',
        icon: 'images/releases/2.6.57/mouse.png',
        title: '2.6.57 Release - Fast mouse plugins stay fast, and four new Dro plugins',
        content: "A fix that keeps a plugin's own mouse speed until you change your antiban settings, so Phosani's Nightmare and Barbarian Fishing click fast again, four new Dro plugins (Elf Thieving, Pyramid Plunder, Inferno Prayers and Colosseum Prayers), and Hub fixes to CG Prep, Tormented Demons, AIO Fighter, Herb Run, Blackjack, Motherlode Mine, Guardians of the Rift and 15 others.",
        author: 'Microbot Team'
    },
    {
        date: new Date('11/09/2026'), //MM/dd/YYYY
        version: '2.6.55',
        icon: 'images/releases/2.6.55/microbot-hub.png',
        title: '2.6.55 Release - A new installed plugins list and five new plugins',
        content: "A rebuilt installed plugins list with sorting, an Only on filter and Hub installs from the search box, a sort menu and plain-worded states in the Hub tab, a banner when an installed plugin's Hub status changes, opt-in hardware ID spoofing, walker, camera and natural mouse fixes, and Hub updates including five new Fourtifys plugins (Phosani's Nightmare, Tormented Demons, Barrows, Agility and Gem Mining), Auto Fishing, Tithe Farm, Revenant Killer, Guardians of the Rift and Tempoross.",
        author: 'Microbot Team'
    },
    {
        date: new Date('11/05/2026'), //MM/dd/YYYY
        version: '2.6.53',
        icon: 'images/releases/2.6.53/pause.png',
        title: '2.6.53 Release - Pause every script with one click',
        content: "A pause button that pauses every running script and gives you the mouse and keyboard, a Local Plugins window to add, update and remove plugin JARs without a restart, Quest Helper fixes for Semi-Auto and Cold War, bank trips that pick a bank you can walk to, login fixes, and Hub updates including the new Sulliuscep plugin, Auto Gauntlet, Barbarian Fisher, Thieving, Arceuus Library, Tempoross and Barrows.",
        author: 'Microbot Team'
    },
    {
        date: new Date('11/03/2026'), //MM/dd/YYYY
        version: '2.6.51',
        icon: 'images/releases/2.6.51/skull.png',
        title: '2.6.51 Release - The 2.6.50 crash is fixed, and ban reports are here',
        content: "A fix for the 2.6.50 error on the Equipment Stats screen, anonymous ban reports you can turn off, a tour step that shows how to report a problem, walker fixes for quetzals, instances, rivers and the Biohazard gate, and Hub updates including the new Auto Gauntlet plugin, Tempoross, Tithe Farm, Blast Furnace, Slayer and Auto Woodcutting.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/31/2026'), //MM/dd/YYYY
        version: '2.6.49',
        icon: 'images/releases/icons/login.png',
        title: '2.6.49 Release - Relogs that keep your Jagex character',
        content: "Relogs on a Jagex-launched client that keep your character even with a saved password, walker clicks that stop cancelling each other, minigame teleports that pick the right destination, eight Inventory Setups fixes, and Hub updates to Guardians of the Rift, Revenant Killer, MM Caves and Barrows.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/31/2026'), //MM/dd/YYYY
        version: '2.6.48',
        icon: 'images/releases/icons/bug-report.png',
        title: '2.6.48 Release - Bug reports that show what happened',
        content: "Bug reports that can include the last 20 minutes of movement, clicks, game messages and script status, Set Target that moves to the nearest walkable tile, and fixes to Quest Helper, tab switching while logged out, Varrock Anvil, Auto Woodcutting, Moons of Peril and Tutorial Island.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/30/2026'), //MM/dd/YYYY
        version: '2.6.47',
        icon: 'images/releases/icons/world-map-target.png',
        title: '2.6.47 Release - Set Target works inside dungeons',
        content: "World map Set Target that walks you into the dungeon you clicked, Jagex Account auto login through the RuneLite launcher that keeps your character, Slayer 1.1.7 stopping when your Slayer Master is out of reach, and fixes to Grand Exchange prices, pop-ups, Auto Essence Mining, Mahogany Homes, MicroAgility, AutoHunter and Gem Crab Killer.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/29/2026'), //MM/dd/YYYY
        version: '2.6.46',
        icon: 'images/releases/icons/walker.png',
        title: '2.6.46 Release - Walker clicks that stay out of the chatbox',
        content: "Walker clicks that stay clear of the chatbox, side panel and minimap, launcher Jagex Account logins that keep their character, every pickaxe variant recognised in Motherlode Mine, Shooting Star and other mining scripts, and fixes to Gem Crab Killer, Volcanic Ash Miner and Tithe Farming.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/29/2026'), //MM/dd/YYYY
        version: '2.6.45',
        icon: 'images/releases/icons/microbot-hub.png',
        title: '2.6.45 Release - Start a script from the dashboard',
        content: "Start any installed script from the dashboard, Jagex Account and legacy profile logins fixed with membership read from the game, faster Stronghold of Security walking, and fixes to Thieving, Gem Crab Killer, Slayer, Auto Fishing and Auto Chompy Killer.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/25/2026'), //MM/dd/YYYY
        version: '2.6.43',
        icon: 'images/releases/icons/logout.png',
        title: '2.6.43 Release - Stop your scripts and log out from the dashboard',
        content: "Stop scripts or log out from the dashboard, break handlers that stay logged out after a deliberate logout, Quest Helper buying quest items in batches on free-to-play, more reliable worn-jewellery teleports and Slayer 1.1.5.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/25/2026'), //MM/dd/YYYY
        version: '2.6.42',
        icon: 'images/releases/icons/bug-report.png',
        title: '2.6.42 Release - Report a problem from inside the client',
        content: "Report a problem from the client and hear back when it's fixed, more reliable login, world hopping and breaks, Quest Helper fixes and Clue Solver 1.0.10 for anagram clues.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/24/2026'), //MM/dd/YYYY
        version: '2.6.41',
        icon: 'images/releases/icons/zeal.png',
        title: '2.6.41 Release - RuneLite 1.13.4 and the Zeal prayer',
        content: 'RuneLite 1.13.4 brings Zeal to the Prayer and XP Drop plugins and a leaner Party plugin, plus fixes to PestControl, MotherlodeMine and HSBlackJack.',
        author: 'Microbot Team'
    },
    {
        date: new Date('10/24/2026'), //MM/dd/YYYY
        version: '2.6.40',
        icon: 'images/releases/icons/pumpkin.png',
        title: '2.6.40 Release - Happy Halloween',
        content: "Bats and jack-o'-lanterns on the client's loading screen, in launcher 3.2.18 and on the website, from 20 October to 1 November.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/24/2026'), //MM/dd/YYYY
        version: '2.6.39',
        icon: 'images/releases/icons/stats.png',
        title: '2.6.39 Release - Check on your bot from the dashboard',
        content: "See your bot's hitpoints, inventory and skills on the dashboard and take a screenshot on request, new death, stuck, low HP and ban alerts, two 2.6.38 slowdowns fixed, and less memory use in long sessions.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/23/2026'), //MM/dd/YYYY
        version: '2.6.38',
        icon: 'images/releases/icons/divine-super-combat.png',
        title: '2.6.38 Release - Divine potions are back in the bank standers',
        content: "Bank's BankStander and AutoBankStander make divine potions again, run stays off when you turn it off, breaks can wait for a safe spot, plus Huey Prayer and Flipper fixes and launcher 3.2.17 with a setup guide.",
        author: 'Microbot Team'
    },
    {
        date: new Date('10/22/2026'), //MM/dd/YYYY
        version: '2.6.37',
        icon: 'images/releases/icons/warning-letter.png',
        title: '2.6.37 Release - Bot alerts are here',
        content: 'Get a Discord or email alert when your bot freezes, errors or logs out, a first-start tour, Quest Helper auto-play and walker fixes, plus updates to 12 Hub plugins, including net traps for Salamanders.',
        author: 'Microbot Team'
    },
    {
        date: new Date('10/20/2026'), //MM/dd/YYYY
        version: '2.6.35',
        icon: 'images/releases/icons/prayer-orb.png',
        title: '2.6.35 Release - Quick prayers are back',
        content: 'Quick prayers work again in every plugin, AIO Fighter stays in its fight area and skips world-spawned loot, Firecape can farm another cape, plus Auto Mining, Clue Solver and stability fixes.',
        author: 'Microbot Team'
    },
    {
        date: new Date('08/15/2025'), //MM/dd/YYYY
        version: '1.9.8',
        icon: 'images/releases/icons/grand-exchange.png',
        title: '1.9.8 Release - Introducing the Microbot Hub',
        content: 'Revolutionary plugin ecosystem launch! Separate repository for community plugins, streamlined development workflow, and comprehensive documentation system.',
        author: 'Microbot Team'
    },
    {
        date: new Date('12/27/2024'), //MM/dd/YYYY
        version: '1.6.6',
        icon: 'images/releases/icons/christmas-cracker.png',
        title: '1.6.6 Release',
        content: 'Holiday event and script improvements!',
        author: 'Mocrosoft'
    },
    {
        date: new Date('12/10/2024'), //MM/dd/YYYY
        version: '1.6.5',
        icon: 'images/releases/icons/blood-rune.png',
        title: '1.6.5 Release',
        content: 'Arceuus Runecrafting (blood runes support, Jewelry Plugin,  and many more!',
        author: 'Mocrosoft'
    },
    {
        date: new Date('11/20/2024'), //MM/dd/YYYY
        version: '1.6.1',
        icon: 'images/releases/icons/tormented-synapse.png',
        title: '1.6.1 Release',
        content: 'Tormented Demon Plugin, Mixology Plugin, Aerial Fishing Plugin, Varrock Museum Cleaner Plugin and many more!',
        author: 'Mocrosoft'
    },
    {
        date: new Date('11/06/2024'), //MM/dd/YYYY
        version: '1.6.0',
        icon: 'images/releases/icons/hammer.png',
        title: '1.6.0 Release',
        content: 'Runelite Update',
        author: 'Mocrosoft'
    },
    {
        date: new Date('11/03/2024'), //MM/dd/YYYY
        version: '1.5.9',
        icon: 'images/releases/icons/law-rune.png',
        title: '1.5.9 Release',
        content: 'Web walker Teleports, Blue Dragons Plugin, New Agility courses, New Herb Run Plugin, New Mahogany homes plugin...',
        author: 'Mocrosoft'
    }
]