To generate PWA icons from your source image:

1. Place your source image in this folder and name it `source-icon.png` (or any name, see command below).
2. Run the Python script in the workspace root:

   python tools/generate_icons.py assets/source-icon.png

This will create:
- assets/icon-180.png  (for apple-touch-icon)
- assets/icon-192.png  (for manifest / Chrome)
- assets/icon-512.png  (for manifest / Play Store)

Requirements:
- Python 3.8+
- Pillow library (`pip install pillow`)

After generating:
- Clear service worker and site data in browser, then re-add the PWA shortcut on your phone.
- If you want, replace apple-touch-icon links in pages to point to `assets/icon-180.png` for iOS.
