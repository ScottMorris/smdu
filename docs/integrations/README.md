# Integrations

## Midnight Commander

`docs/integrations/smdu-mc.ini` is a Midnight Commander skin derived from SMDU's default palette.
It uses ASCII-style panel dividers for the main layout and box-drawing lines for dialogs/modals.

To use it locally:

```bash
mkdir -p ~/.config/mc/skins
cp docs/integrations/smdu-mc.ini ~/.config/mc/skins/smdu.ini
mc -S smdu
```

If your terminal supports true colour, leave `COLORTERM=truecolor` (or `24bit`) enabled for the closest match.
