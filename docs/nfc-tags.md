# NFC coin links

Each panda coin sticker stores one HTTPS address. iPhone does not let a website read NFC tags, so the sticker itself opens Safari.

Use the public HTTPS origin where this app is deployed. On GitHub Pages that is `https://YOUR_USER.github.io/REPO_NAME/` for a project site, or `https://YOUR_USER.github.io/` when the repository is named `YOUR_USER.github.io`.

```text
https://YOUR_DOMAIN/?coin=1
https://YOUR_DOMAIN/?coin=2
...
https://YOUR_DOMAIN/?coin=50
```

The numbers are intentionally simple. Guessing or reopening a link is acceptable for this gift. A repeated visit shows a toast and does not add another coin.

## Before writing all 50 tags

1. Deploy the app and open `https://YOUR_DOMAIN/?coin=1` in Safari once, so the phone has the page.
2. Write that same address to one NTAG213 or NTAG215 sticker.
3. On an iPhone XS or newer, wake the phone and touch the sticker near the top edge.
4. Tap the iOS notification. Safari should open home and show coin 1 with fireworks.
5. Scan it again. The app should toast that the coin is already in the collection, and the balance should stay the same.
6. Only then write coins 2 through 50.

iPhone 7, 8, and X do not scan tags in the background. Those phones can use the NFC reader in Control Center, or the QR code below.

## Write a tag

Any NDEF writer works. [NFC Tools](https://apps.apple.com/app/nfc-tools/id1252962749) is enough:

1. Choose **Write**.
2. Add a record of type **URL / URI**.
3. Enter the full coin address, including `https://`.
4. Write it to a sticker placed on the coin.
5. Optionally make the tag read-only after the test scan succeeds. Do that only when the address is final, because a locked tag cannot be corrected.

The sticker can be an NTAG213. It only needs to store a short URL. Leave the antenna uncovered by metal.

## QR fallback

Put a QR code for the same address beside or behind the NFC sticker. If iOS does not show a notification, the QR code opens the same page.

## What the phone will do

- The screen must be on. The phone must have been unlocked at least once since it started.
- Airplane mode, the camera, and Apple Pay pause background scanning.
- iOS shows a notification. Nothing is collected until that notification is tapped.
- The website stores progress in this browser. Clearing Safari website data resets the collection. Adding the site to the Home Screen is optional and does not require an App Store install.

## Checklist

- [ ] One test tag opens `/?coin=1` from the iPhone notification.
- [ ] The first visit shows the coin popup and adds one coin.
- [ ] The second visit shows a duplicate toast.
- [ ] Coins 1–50 are written with the final domain.
- [ ] Each sticker has a QR code for the same address.
- [ ] Coins 5, 10, 15, 20, 25, 30, 35, 40, 45, and 50 play their recording after they are found.
