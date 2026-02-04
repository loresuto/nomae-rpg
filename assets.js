const ASSETS = {
    DRAGON: String.raw`
    ,   ,
   / \_/ \
  (  o.o  )
   >  ^  <
  /       \
 /         \
(           )
 \__|   |__/
    |   |
   _|   |_
`,

    LOGO: String.raw`
 _  _   __   __  __   __   ____ 
( \( ) /  \ (  \/  ) / _\ (  __)
 )  ( (  O ) )    ( /    \ ) _) 
(_)\_) \__/ (_/\/\_)\_/\_/(____)
`,

    // Character Creation
    DICE: String.raw`
       .-------.
      /   o   /|
     /_______/ |
     | o   o | |
     |   o   | /
     | o   o |/
     '-------'
    `,

    // Stan's Armory
    STAN: String.raw`
        ,~~~~~,
       / .   . \
      (   ___   )     < STAN THE FIGHTER >
       \  '|'  /   "BUY SOMETHING OR GET OUT!"
        \_____/
        /|   |\
       / |___| \
    `,

    // Monsters (3 Variations per type)
    MONSTERS: {
        SLIME: [
            String.raw`
      _______
     /  o o  \  oozer
    |    ^    |
     \_______/
    `,
            String.raw`
       .---.
      ( o o )   gooey
       \ - /
        '-'
    `,
            String.raw`
       /~~~\  slimeo
      ( O O )
       \_~_/
    `
        ],
        SKELETON: [
            String.raw`
      (o) (o) peepers
       \   /
       /___\
      /| | |\
    `,
            String.raw`
       [o_o]  baby skelly
       /| |\
       /| |\
    `,
            String.raw`
       /x_x\.  lights out
      (  |  )
      /| | |\
    `
        ],
        RAT: [
            String.raw`
       (oXo)
      (  "  )
       \___/  
            `,
            String.raw`
       <'-'>
       (   )
       -"-"-
            `,
            String.raw`
       (ovo)
      //   \\
      "     "
            `
        ],
        GOBLIN: [
            String.raw`
       <ò.ó>
       ( > )
       /| |\
            `,
            String.raw`
       /| |\
      ( O.O )
       \_-_/
            `,
            String.raw`
       [^.^]
       /   \
      |  |  |
            `
        ]
    },

    CORPSE: String.raw`
       .---.
      / x x \
     |   ^   |
      \__-__/
       R.I.P
    `,

    // Treasures (3 Variations)
    TREASURE: [
        String.raw`
      .-------.
     /___C___/|
     |   |   |/
     '-------'
    `,
        String.raw`
       (_______)
       |  [$]  |
       |_______|
    `,
        String.raw`
        /\___/\
       (  ( )  )
        \_____/
    `
    ],

    // Boss - The Dragon
    BOSS: String.raw`
        ____ /\
       /    V  \
      |  O   O  |
       \   ∆   /
     ___\_____/___
    /  /|  |  |  \
   /  / |__|__| \ \
  <__>          <__>
       ANCIENT DRAGON
    `,

    // Dungeon entrance portal (at 0,0)
    PORTAL: String.raw`
       .--====--.
      /  ~~~~~~  \
     |  ~PORTAL~  |
      \  ~~~~~~  /
       '--====--'
    `,

    // Victory trophy
    VICTORY: String.raw`
         ___________
        '._==_==_=_.'
        .-\:      /-.
       | (|:.     |) |
        '-|:.     |-'
          \::.    /
           '::. .'
             ) (
           _.' '._
          '-------'
         CHAMPION!
    `
};
