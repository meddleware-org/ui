// Screenshots for LOOKING at the gallery (see @meddleware/frontend-config/shots). Run: npm run shots
import { defineShots } from '@meddleware/frontend-config/shots'

const view = (v: string, wait = 'main') => async (page: import('@playwright/test').Page) => {
  await page.goto(`/?view=${v}`)
  await page.waitForSelector(wait)
}
defineShots({ all: view('all'), panels: view('panels'), dialog: view('dialog', 'dialog[open]') })
