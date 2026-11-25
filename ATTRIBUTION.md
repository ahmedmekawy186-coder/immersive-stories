# Attribution
- A-Frame 1.8.0 (MIT) https://aframe.io, bundled in lib/ with lib/LICENSE-aframe.txt
- Cairo font, Arabic subset (SIL Open Font License 1.1) via @fontsource/cairo
- All 3D geometry and audio in v1 are procedural (no third-party assets).

## Visual revision 5
- Casual Walker v1, tevy, CC0 1.0. https://tevy.dev/models/casual-walker . LOD1 decoded from meshopt for compatibility, role color tints and seated poses applied in the scene. This is a stylized human, not a photoreal scan.
- WoodFloor001 and Plaster001, ambientCG, CC0 1.0. https://ambientcg.com/view?id=WoodFloor001 and https://ambientcg.com/view?id=Plaster001 . Color textures resized to 512 pixels. License: https://ambientcg.com/license
- Basis Universal transcoder bundled with Three.js, Apache License 2.0. https://github.com/BinomialLLC/basis_universal . Three.js integration: MIT.
- Hands, room details, furniture detail geometry, signs and clock are original procedural geometry/canvas artwork.
- Voice files retained from v4 until Gemini replacement is available. Not Gemini voices yet.

## Visual revision 6 (characters)
- Tevy Casual Walker (v5) is no longer used for people.

## People (v6)
- Character bodies, hair, eyebrows, eyes, clothes and shoes: MakeHuman system assets (CC0 1.0), https://static.makehumancommunity.org/assets/assetpacks/ . Characters were generated headless with the makehuman-mcp library and converted to glb with Blender. Shirt and suit colours were recoloured. Cast poses are set in code.
- Quaternius Universal Base Characters (CC0) was evaluated and not used.

- Motion-capture style animation clips (public domain / CC0 1.0), https://anim.gameasset.net/ : 7543 gestures with hands while explaining, 7387 types on laptop while sitting, 8842 clicks mouse absentmindedly, 8860 sits in an office chair relaxed, 8892 clicks mouse during virtual call. Retargeted to the MakeHuman rig in js/visuals-v5.js. Teacher beard painted on the face texture by kit/scripts/beard.py.
