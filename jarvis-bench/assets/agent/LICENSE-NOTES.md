# Licence notes: the "ready" robot (licensed ready-made animation)

Everything the live site would load from this folder is third-party under a licence that allows use on a public website, plus
our own glue code (robot.css, robot.js, tools/). Checked 2026-11-05.

## What is used

### 1. The animation: "Ai Robot Vector Art" by Abdul Latif, LottieFiles

- Source page: https://lottiefiles.com/free-animation/ai-robot-vector-art-uD5dnmVYlT (published 2025-11-13, listed under "Free animations")
- File downloaded: https://assets-v2.lottiefiles.com/a/02fe4bd5-8c88-4351-a78f-353a57ea279a/qwM2Hfg6Ko.json (30,568 bytes, 682 x 902, 30 fps, 180 frames, 10 shape layers, no raster assets)
- Author: Abdul Latif (LottieFiles creator name as shown on the page; the page's JSON-LD gives `creator.name` "Abdul Latif" and `license` https://lottiefiles.com/page/license)
- Licence: Lottie Simple License (FL 9.13.21), full text below. It allows download, modification, publication and public display including commercial use;
  derivatives must stay under the same licence; attribution is encouraged, not required.
- Our changes (derivative work, same licence): layer `cl` class names (rb-eyes, rb-face, rb-head, rb-ears, rb-body, rb-hand, rb-shadow) so the
  renderer tags the groups the CSS moves with the gaze; the eyes' and visor's own left-right wander damped to 35 % so the gaze target owns the eye
  position; recolour cyan/navy/cool grey to the site's peach / warm ink / warm grey (`robot.json`, `robot-data.js`). `robot-data-cyan.js` is the
  same file with the original colours. The build is reproducible with `tools/build_robot.py`.
- Suggested credit (optional under the licence), e.g. in the site's credits list: "Jarvis robot: 'Ai Robot Vector Art' by Abdul Latif on LottieFiles, Lottie Simple License, recoloured."
- Caveat: LottieFiles grants the licence for files uploaded to its site; it does not let us verify independently that the uploader drew the
  artwork. The same upload also appears re-published by another account ("Ai chat" by Muhammad Faisal Ishaq, 2026-07-30, identical asset id), which is
  common on LottieFiles. If the team wants an asset whose author is clearly the original motion designer, the two runner-ups below (Marlon Bulaquena,
  Mikhail Voloshin) are the safer picks.

Lottie Simple License, verbatim from https://lottiefiles.com/page/license (fetched 2026-11-05):

> Lottie Simple License (FL 9.13.21)
>
> Copyright © 2021 Design Barn Inc.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of the public animation files available for download at the
> LottieFiles site ("Files") to download, reproduce, modify, publish, distribute, publicly display, and publicly digitally perform such Files,
> including for commercial purposes, provided that any display, publication, performance, or distribution of Files must contain (and be subject
> to) the same terms and conditions of this license. Modifications to Files are deemed derivative works and must also be expressly distributed
> under the same terms and conditions of this license. You may not purport to impose any additional or different terms or conditions on, or apply
> any technical measures that restrict exercise of, the rights granted under this license. This license does not include the right to collect or
> compile Files from LottieFiles to replicate or develop a similar or competing service.
>
> Use of Files without attributing the creator(s) of the Files is permitted under this license, though attribution is strongly encouraged. If
> attributions are included, such attributions should be visible to the end user.
>
> FILES ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. EXCEPT TO THE EXTENT REQUIRED BY APPLICABLE LAW, IN NO EVENT WILL THE CREATOR(S) OF FILES
> OR DESIGN BARN, INC. BE LIABLE ON ANY LEGAL THEORY FOR ANY SPECIAL, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES ARISING OUT OF THIS
> LICENSE OR THE USE OF SUCH FILES.

### 2. The player: lottie-web 5.13.0, light build

- Source: https://unpkg.com/lottie-web@5.13.0/build/player/lottie_light.min.js (168,394 bytes; 46.5 KB gzip); repo https://github.com/airbnb/lottie-web
- Author: Hernan Torrisi (bodymovin) and contributors, "Copyright (c) 2015 Bodymovin"
- Licence: MIT, copied to `LICENSE-lottie-web.md` (from https://unpkg.com/lottie-web@5.13.0/LICENSE.md). The light build has no expressions support; this
  file uses none. Vendored unmodified.

### 3. Original work (all original, no third-party code)

`robot.css`, `robot.js`, `tools/build_robot.py`, `tools/make_preview.py`, `tools/shots.mjs`, `README.md`, this file. `preview.html` is the site's own
index.html with the robot dropped in and relative paths rewritten (site content, same ownership as the site).

## Candidates considered

Searched 2026-11-05: LottieFiles tag pages robot, chatbot, bot, ai-assistant, ai, cute-robot, android, droid, robotics, ai-bot (136 free animations, 87
robot-like after a name filter, all under the Lottie Simple License), GitHub repository search (robot lottie / animated robot svg / robot animation css /
robot mascot animation), Google Noto animated emoji, Rive marketplace, Storyset, Lordicon, CodePen. All 87 LottieFiles previews were viewed on contact
sheets; 18 were rendered live at the real 112 px disc size before choosing.

| # | Candidate | Author / source | Licence | Decision |
| --- | --- | --- | --- | --- |
| 1 | Ai Robot Vector Art, https://lottiefiles.com/free-animation/ai-robot-vector-art-uD5dnmVYlT | Abdul Latif, LottieFiles | Lottie Simple License | **Chosen**: head and shoulders fill the disc, reads as a friendly premium robot at 112 px, has blink + float + nod + hand wobble, pure vector 30 KB, clean layer names for the gaze. Recoloured. |
| 2 | Anima Bot, https://lottiefiles.com/free-animation/anima-bot-2xV5SQxoot | Marlon Bulaquena, LottieFiles | Lottie Simple License | Runner-up: very clean floating white robot, 15 KB, but small head and two dash eyes at 112 px read cold; layers are unnamed (single letters) so gaze wiring is fragile. |
| 3 | Robot assistant // Online manager, https://lottiefiles.com/free-animation/robot-assistant-online-manager-sT8Lqokur4 | Mikhail Voloshin, LottieFiles | Lottie Simple License | Runner-up: same virtues and limits as Anima Bot (near-identical design, 2021). |
| 4 | Cute Robot Cube, https://lottiefiles.com/free-animation/cute-robot-cube-jTlE221ZDb | Oshie Labs, LottieFiles | Lottie Simple License | Rejected: flat orange cube with cartoon eyes already matches the peach accent and is only 11 KB, but it reads as a toy/emoji, which the user rejected before. Keep in mind if a flat look is wanted. |
| 5 | Robot says hello, https://lottiefiles.com/free-animation/robot-says-hello-iUyDAnJFQ3 | Mikhail Voloshin, LottieFiles | Lottie Simple License | Rejected: magenta gradient, speech bubble, 44 KB; the character is tiny inside its canvas. Re-uploaded by three other accounts (AI bot animated hi, chatbot, Hello Chat Bot). |
| 6 | Dancing Robot, https://lottiefiles.com/free-animation/dancing-robot-sFPCRNZBAj | Valentina Salinas Dori, LottieFiles | Lottie Simple License | Rejected: flat magenta, dancing motion too busy for a dial centre, 59 KB. |
| 7 | Robot, https://lottiefiles.com/free-animation/robot-ubUi1tVpjU | Tomás Lefever, LottieFiles | Lottie Simple License | Rejected: did not render in lottie_light (blank), red visor, 82 KB. |
| 8 | chatbot_header, https://lottiefiles.com/free-animation/chatbot-header-Hxhle8dd6t | Hyewon Son, LottieFiles | Lottie Simple License | Rejected: ink-only head with three dots, close to the flat helmet the user rejected. |
| 9 | Futuristic Robot Constructor, https://lottiefiles.com/free-animation/futuristic-robot-constructor-ohlkmEE0e3 | Tanjil Mahmud, LottieFiles | Lottie Simple License | Rejected: full-body figure, details vanish at 112 px, 45 KB. |
| 10 | Little power robot, https://lottiefiles.com/free-animation/little-power-robot-BtnSKUJQgN | Md. Fazle Hasan, LottieFiles | Lottie Simple License | Rejected: line-art icon, toy-like, 41-frame loop. |
| 11 | Robot Says Hi, https://lottiefiles.com/free-animation/robot-says-hi-9kNmfFz2s8 | Mikhail Voloshin, LottieFiles | Lottie Simple License | Rejected: busy pose with a "HI!" bubble, 62 KB. |
| 12 | RobotSaludando, https://lottiefiles.com/free-animation/robotsaludando-ZnoACNm8G9 | Gian Guatibonza, LottieFiles | Lottie Simple License | Rejected: 8 embedded raster images (blurry when scaled), 62 KB. |
| 13 | AI Robot, https://lottiefiles.com/free-animation/ai-robot-teaAovRePh | Maryl Mae Saguilongan, LottieFiles | Lottie Simple License | Rejected: 225 KB, green gradient. |
| 14 | Chatbot, https://lottiefiles.com/free-animation/chatbot-cuRuo13BSl | JAStudio, LottieFiles | Lottie Simple License | Rejected: icon on a blue circle background. |
| 15 | Ai chat, https://lottiefiles.com/free-animation/ai-chat-qwM2Hfg6Ko (identical JSON to #1, later re-upload) | Muhammad Faisal Ishaq, LottieFiles | Lottie Simple License | Not used; noted as provenance evidence for #1. |
| 16 | Noto Animated Emoji, robot U+1F916, https://googlefonts.github.io/noto-emoji-animation/ (Lottie at https://fonts.gstatic.com/s/e/notoemoji/latest/1f916/lottie.json, 187 KB) | Google | Noto Emoji images are Apache 2.0 per https://github.com/googlefonts/noto-emoji (the animation site itself shows no licence text in its HTML/bundle) | Rejected on looks: grey square emoji face with red ears and teeth, exactly the emoji look the user rejected. |
| 17 | Avatar Studio robot avatars, https://github.com/ai-calypse/avatar-studio (built on CX ArtLab's agent-robot-avatar) | ai-calypse / CX ART Lab | MIT | Rejected on looks: glossy 3D "pebble" heads with accessories or a flat dark helmet with a pink visor, both styles already rejected by the user. Interesting API (cursor following, expressions) but not the look. |
| 18 | Storyset "Robot face" / "Cool robot", https://storyset.com/search?q=robot | Freepik (Storyset) | Freepik licence: free with attribution | Rejected: scene illustrations, not a single character; attribution link required on the page; animation only via Storyset's own export. |
| 19 | Lordicon wired robot icons, https://lordicon.com/icons/wired/outline?q=robot | Lordicon | Free set needs an attribution link; needs their player | Rejected: icon-grade line drawings, attribution requirement. |
| 20 | Rive marketplace robots, https://rive.app/marketplace | various | Community files are CC BY 4.0 by default | Not pursued: the search page returned 404 headless and the Rive web runtime is about 1 MB of WASM, too heavy for a dial centre. |
| 21 | CodePen robot pens (MIT by CodePen terms) | various | MIT | Not reachable: the search page sits behind a Cloudflare challenge in headless Chrome. |
| 22 | GitHub repos "Lottie-Robot-Animation", "raven-robot-lottie-svg", "FireSprites" | guy-codette, festoqufx, Firestorm0609 | no licence file | Rejected: no licence, so no right to use. |

## Weight of what the live site loads

lottie_light.min.js 168,394 + robot-data.js 32,786 + robot.css 2,785 + robot.js 3,062 = 207,027 bytes raw, 53,534 bytes gzip.
