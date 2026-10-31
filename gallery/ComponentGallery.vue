<script setup lang="ts">
import { ref } from 'vue'
import {
  AppFooter, AppHeader, AppSidebar, AppTabNav, ColorModeControl, CopyableAddress, CopyrightLine, ExplorerLink,
  SidebarGroup, SidebarItem, StatusWidget, UiActivityFeed, UiActivityItem, UiAmount, UiAppShell, UiBadge, UiButton, UiCard,
  UiCheckField, UiCodeBlock, UiCopyButton, UiDataTable, UiDateTimeField, UiDialog, UiEmptyState, UiFieldHint, UiFormField,
  UiLiveStatus, UiMeter, UiNotice, UiPager, UiPanel, UiSegmentedControl, UiSelect, UiSelectField, UiStatGrid, UiStatRow,
  UiFileField, UiStatusBar, UiStatusDot, UiStepper, UiTabPanel, UiTextField, UiToolIntro, UiToolbar, UiToolbarButton, useColorMode,
} from '../src/index'

const props = defineProps<{ view: string; theme: 'light' | 'dark' }>()

const address = `0x${'ab'.repeat(31)}cd`
const tab = ref('a')
// The real colour-mode state, so the control in the gallery does what it does in an app (and a screenshot can drive it). The page's theme
// from the query is its starting mode.
const { mode, set: setMode } = useColorMode(props.theme)
const segment = ref('x')
const step = ref(1)
const name = ref('Sample token')
const network = ref('testnet')
const sendAt = ref<string | null>('2026-07-01T08:30:00.000Z')
const flag = ref(true)
const symbol = ref('')
</script>

<template>
  <!-- The dialog is modal (it makes the rest of the page inert), so it has its own view. -->
  <UiDialog v-if="view === 'dialog'" open title="Before you deploy" dismissible>
    <p>Terms apply. <a href="https://example.org/terms">Read the terms</a>.</p>
    <template #actions>
      <UiButton variant="primary">Continue</UiButton>
      <UiButton variant="ghost">Cancel</UiButton>
    </template>
  </UiDialog>

  <!-- The shell panels in the variants the main view does not use, over the page theme. The header's menu button and the sidebar drawer
       appear below 45em. -->
  <UiAppShell v-else-if="view === 'panels'" contained>
    <template #header>
      <AppHeader variant="light" sidebar-id="gallery-nav">
        <template #brand><a href="/">Meddleware</a></template>
        <template #actions><UiButton variant="ghost">Connect wallet</UiButton><button type="button">Connect</button></template>
      </AppHeader>
    </template>
    <template #sidebar>
      <AppSidebar id="gallery-nav" variant="dark">
        <SidebarGroup label="Blockchain">
          <SidebarGroup label="Sui" :level="2"><SidebarItem label="Treasury" active /><SidebarItem label="Docs" href="/docs" /></SidebarGroup>
        </SidebarGroup>
        <template #foot><p><a href="https://example.org/wallet">Wallet help</a></p></template>
      </AppSidebar>
    </template>
    <h1>Panels</h1>
    <p>Shell panels in the variants the main view does not use.</p>
    <template #footer>
      <AppFooter variant="dark" docs-url="https://docs.example.org" dev-url="https://dev.example.org">
        <template #start><a href="https://example.org/legal">Legal</a></template>
      </AppFooter>
    </template>
  </UiAppShell>

  <template v-else>
    <AppHeader variant="dark">
      <template #brand><a href="/">Meddleware</a></template>
      <template #actions><CopyableAddress :address="address"><ExplorerLink href="https://suiscan.xyz/mainnet/account/0x1" :value="address" /></CopyableAddress><UiButton variant="ghost">Connect wallet</UiButton><UiButton variant="secondary">Connect</UiButton></template>
    </AppHeader>

    <div class="shell">
      <AppSidebar variant="light">
        <SidebarGroup label="Blockchain">
          <SidebarItem label="Sui" active />
          <SidebarItem label="Walrus" />
        </SidebarGroup>
        <template #foot><p>No wallet connected <UiButton variant="ghost" size="sm">Connect</UiButton></p></template>
      </AppSidebar>

      <main>
        <h1>Gallery</h1>
        <UiToolIntro>Deploy a token. <a href="https://example.org/docs">Documentation</a> explains each step.</UiToolIntro>
        <p>
          Running text with a <a href="https://example.org/a">plain link</a> and the address
          <ExplorerLink href="https://suiscan.xyz/mainnet/account/0x1" :value="address" />, copyable:
          <CopyableAddress :address="address" /> or just <UiCopyButton value="0x1" label="Copy id" />.
        </p>
        <p><small>Secondary metadata</small> <code>0x1234</code> <UiAmount :value="13_100_000n" symbol="WAL" /></p>

        <section>
          <h2>Buttons</h2>
          <UiButton variant="primary">Primary</UiButton>
          <UiButton variant="secondary">Secondary</UiButton>
          <UiButton variant="ghost">Ghost</UiButton>
          <UiButton variant="danger">Danger</UiButton>
          <UiButton variant="primary" disabled>Disabled</UiButton>
          <UiButton variant="primary" busy>Saving</UiButton>
          <UiButton variant="primary" size="sm">Small</UiButton>
          <UiButton variant="ghost" href="https://example.org/x">As a link</UiButton>
          <UiButton variant="link" href="https://example.org/y">Link variant</UiButton>
          <UiToolbarButton>Refresh</UiToolbarButton>
        </section>

        <section>
          <h2>Notices, badges and status</h2>
          <UiNotice>Informational note.</UiNotice>
          <UiNotice type="warning">Careful: this is a warning.</UiNotice>
          <UiNotice type="error">Something failed.</UiNotice>
          <UiNotice type="ok">Saved.</UiNotice>
          <UiBadge tone="ok">Posted</UiBadge>
          <UiBadge tone="warn" symbol="◐">Queued</UiBadge>
          <UiBadge tone="danger">Failed</UiBadge>
          <UiBadge tone="info">Note</UiBadge>
          <UiBadge tone="accent">Tag</UiBadge>
          <UiBadge>Neutral</UiBadge>
          <UiBadge variant="active">Active (old)</UiBadge>
          <UiBadge variant="pending">Pending (old)</UiBadge>
          <UiStatusDot status="operational" /><UiStatusDot status="degraded" /><UiStatusDot status="down" size="md" /><UiStatusDot status="unknown" />
          <StatusWidget api-url="/status.json" href="https://status.example.org" />
        </section>

        <section>
          <h2>Forms</h2>
          <UiTextField id="name" v-model="name" label="Token name" hint="Shown in wallets" />
          <UiTextField id="symbol" v-model="symbol" label="Symbol" error="A symbol is required" />
          <UiTextField id="about" v-model="name" label="About" :rows="2" />
          <UiFileField id="icon" label="Icon" hint="PNG or SVG, up to 256 KiB" accept="image/png,image/svg+xml" />
          <UiSelectField id="net" v-model="network" label="Network" :options="[['testnet', 'Testnet'], ['mainnet', 'Mainnet']]" />
          <UiDateTimeField id="at" v-model="sendAt" label="Send at" zone="Europe/London" />
          <UiCheckField v-model="flag" label="Send now" hint="goes live immediately" />
          <UiFormField id="legacy" label="Legacy field" hint="Built from the parts">
            <template #default="{ attrs }"><UiSelect v-bind="attrs"><option value="testnet">Testnet</option></UiSelect></template>
          </UiFormField>
          <UiFieldHint field-id="name">Explains the field.</UiFieldHint>
          <UiSegmentedControl
            v-model="segment"
            label="Mode"
            :options="[{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }, { id: 'z', label: 'Z', disabled: true }]"
          />
          <UiSegmentedControl v-model="segment" label="Filter" layout="grid" :options="[{ id: 'x', label: 'Planned' }, { id: 'y', label: 'In progress' }, { id: 'z', label: 'Done' }, { id: 'w', label: 'Cancelled' }]" />
          <ColorModeControl :model-value="mode" @update:model-value="setMode" />
          <UiStepper v-model="step" class="wide" :steps="[{ id: 'a', label: 'Details' }, { id: 'b', label: 'Review' }, { id: 'c', label: 'Deploy' }]" />
          <UiStepper orientation="vertical" :steps="[{ id: 'a', label: 'Publish', status: 'done' }, { id: 'b', label: 'Verify', status: 'busy' }, { id: 'c', label: 'Share', status: 'error' }, { id: 'd', label: 'Archive', status: 'pending' }]" />
        </section>

        <section>
          <h2>Navigation</h2>
          <AppTabNav v-model="tab" id-prefix="t" aria-label="Sections" :tabs="[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]" />
          <UiTabPanel id-prefix="t" tab="a"><p>Alpha content</p></UiTabPanel>
          <AppTabNav v-model="tab" id-prefix="r" variant="raised" aria-label="Raised sections" :tabs="[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]" />
          <UiTabPanel id-prefix="r" tab="a"><p>Raised content</p></UiTabPanel>
          <UiToolbar label="Page actions" :actions="[{ id: 'home', label: 'Home' }, { id: 'help', label: 'Help' }, { id: 'off', label: 'Off', disabled: true }]" />
          <UiPager :index="1" has-next label="Gallery pages" />
        </section>

        <section>
          <h2>Panels and data</h2>
          <UiPanel title="Recent activity">
            <UiActivityFeed>
              <UiActivityItem type="Minted" time="ckpt 1" />
              <UiActivityItem type="Consumed" time="ckpt 2" datetime="2026-10-08T00:00:00Z" />
            </UiActivityFeed>
          </UiPanel>
          <UiCard title="Gate"><p>Body</p><template #footer><p>Footer</p></template></UiCard>
          <ul class="cards" role="list">
            <UiCard as="li" plain :level="3" title="A plain item"><p>No header band.</p></UiCard>
            <UiCard as="li" plain :level="3" title="A linked item" href="https://example.org/tool"><p>The whole card links.</p></UiCard>
          </ul>
          <UiStatGrid>
            <UiStatRow label="Balance"><UiAmount :value="1_500_000_000n" /></UiStatRow>
            <UiStatRow label="Gates">3</UiStatRow>
            <UiStatRow label="Object" align="left">0x1111111111111111111111111111111111111111111111111111111111111111</UiStatRow>
          </UiStatGrid>
          <UiDataTable caption="Gates" :rows="1" empty="Nothing yet">
            <template #head><th scope="col">Name</th><th scope="col">State</th></template>
            <tr><th scope="row">Alpha</th><td><UiBadge tone="ok">Active</UiBadge></td></tr>
          </UiDataTable>
          <UiDataTable caption="Empty gates" :rows="0" empty="Nothing yet">
            <template #head><th scope="col">Name</th><th scope="col">State</th></template>
          </UiDataTable>
          <UiMeter label="Within" :used="20" :limit="100" unit="USD" />
          <UiMeter label="Close" :used="85" :limit="100" unit="USD" />
          <UiMeter label="Over" :used="130" :limit="100" unit="USD" />
          <UiEmptyState>No posts yet.<template #action><UiButton variant="ghost">Write one</UiButton></template></UiEmptyState>
          <UiLiveStatus message="Saved 2 changes" />
          <UiCodeBlock label="Payload" code='{ "network": "testnet", "gate": "0x1" }' />
          <UiStatusBar network="testnet" :healthy="false" :epoch="42" :last-refresh="null" />
        </section>
      </main>
    </div>

    <AppFooter variant="transparent" docs-url="https://docs.example.org" dev-url="https://dev.example.org">
      <template #start><CopyrightLine organisation-name="Meddleware" symbol-variant="kopimi" /></template>
    </AppFooter>
  </template>
</template>

<style scoped>
.shell { display: flex; gap: var(--space-md); align-items: flex-start; }
main { flex: 1; min-width: 0; padding: var(--space-sm); background: var(--bg); color: var(--text); }
section { margin-block: var(--space-sm); display: flex; flex-wrap: wrap; gap: var(--space-xs); align-items: center; }
section > h2 { flex-basis: 100%; }
.wide { flex-basis: 100%; }
.cards { display: grid; gap: var(--space-xs); margin: 0; padding: 0; list-style: none; }
</style>
