game-evolution
==============

The game contains from different <b>"modules"</b>:
- Main (where the initialize logic and main functionality is implemented)
- Render (module to draw our object on the canvas)
- Customization (module to customize hero)
- Audio (play sound and music)
- Helper (contains helper functions and functions for collision algoritm)
- Sprites (use for animation)

<br/>

All static <b>data</b> contains in data folder. There are images for fish parts (mouth, fin, tail, etc), background and barrier images, sound. Also there are global data for game. You can choose necessary value here (<b>!!! be careful</b> data isn't validated in the game).
This data describe:
- map:
  - height
  - width
  - background image
  - barrier height
  - barrier width
  - barrier image
  - parallax value for background and effect layer
  - percentage of barrier on the map
  - fish count
  - game time
- constructor (describe part of fish and their damage):
  - mouth
  - fin
  - tail
  - horn
  - body
- fish (descibe what parts contain in a fish)
  - width
  - height
  - parts
- audio (describe what sound are used for different situations)

<br/>

<b>TODO:</b>
- added fish view to customization functionality
- added eyes to fish
- fixed animation
- added effects
- added checking for input data
