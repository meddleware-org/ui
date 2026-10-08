<script setup lang="ts">
import { ref } from 'vue'
import {
  AppFooter, AppHeader, AppSidebar, AppTabNav, ColorModeControl, CopyableAddress, CopyrightLine, ExplorerLink,
  SidebarGroup, SidebarItem, StatusWidget, UiActivityFeed, UiActivityItem, UiBadge, UiButton, UiCard,
  UiDataTable, UiDialog, UiFieldHint, UiFormField, UiNotice, UiPanel, UiSegmentedControl, UiSelect,
  UiStatGrid, UiStatRow, UiStatusBar, UiStatusDot, UiStepper, UiTabPanel, UiToolIntro, UiToolbar,
  UiToolbarButton,
} from '../src/index'

defineProps<{ view: string }>()

const address = `0x${'ab'.repeat(31)}cd`
const tab = ref('a')
const mode = ref<'light' | 'dark' | 'system'>('light')
const segment = ref('x')
const step = ref(1)
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

  <!-- The shell panels in the variants the main view does not use, over the page theme. -->
  <template v-else-if="view === 'panels'">
    <AppHeader variant="light">
      <template #brand><a href="/">Meddleware</a></template>
      <template #actions><button type="button">Connect</button></template>
    </AppHeader>
    <div class="shell">
      <AppSidebar variant="dark">
        <SidebarGroup label="Blockchain">
          <SidebarGroup label="Sui" :level="2"><SidebarItem label="Treasury" /></SidebarGroup>
        </SidebarGroup>
        <template #foot><p><a href="https://example.org/wallet">Wallet help</a></p></template>
      </AppSidebar>
      <main><h1>Panels</h1><p>Shell panels in the variants the main view does not use.</p></main>
    </div>
    <AppFooter variant="dark" docs-url="https://docs.example.org" dev-url="https://dev.example.org">
      <template #start><a href="https://example.org/legal">Legal</a></template>
    </AppFooter>
  </template>

  <template v-else>
    <AppHeader variant="dark">
      <template #brand><a href="/">Meddleware</a></template>
      <template #actions><UiButton variant="secondary">Connect</UiButton></template>
    </AppHeader>

    <div class="shell">
      <AppSidebar variant="light">
        <SidebarGroup label="Blockchain">
          <SidebarItem label="Sui" active />
          <SidebarItem label="Walrus" />
        </SidebarGroup>
        <template #foot><p>No wallet connected</p></template>
      </AppSidebar>

      <main>
        <h1>Gallery</h1>
        <UiToolIntro>Deploy a token. <a href="https://example.org/docs">Documentation</a> explains each step.</UiToolIntro>
        <p>
          Running text with a <a href="https://example.org/a">plain link</a> and the address
          <ExplorerLink href="https://suiscan.xyz/mainnet/account/0x1" :value="address" />, copyable:
          <CopyableAddress :address="address" />.
        </p>
        <p><small>Secondary metadata</small> <code>0x1234</code></p>

        <section>
          <h2>Buttons</h2>
          <UiButton variant="primary">Primary</UiButton>
          <UiButton variant="secondary">Secondary</UiButton>
          <UiButton variant="ghost">Ghost</UiButton>
          <UiButton variant="danger">Danger</UiButton>
          <UiButton variant="primary" disabled>Disabled</UiButton>
          <UiToolbarButton>Refresh</UiToolbarButton>
        </section>

        <section>
          <h2>Notices and badges</h2>
          <UiNotice>Informational note.</UiNotice>
          <UiNotice type="error">Something failed.</UiNotice>
          <UiNotice type="ok">Saved.</UiNotice>
          <UiBadge variant="active">Active</UiBadge>
          <UiBadge variant="closed">Closed</UiBadge>
          <UiBadge variant="pending">Pending</UiBadge>
          <UiBadge variant="neutral">Neutral</UiBadge>
          <UiStatusDot status="ok" /><UiStatusDot status="warn" /><UiStatusDot status="error" />
          <StatusWidget api-url="/status.json" href="https://status.example.org" />
        </section>

        <section>
          <h2>Forms</h2>
          <UiFormField id="name" label="Token name" hint="Shown in wallets">
            <!-- The label association is made through the slot props (id, aria-describedby); the linter cannot follow them. -->
            <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -->
            <template #default="{ attrs }"><input type="text" v-bind="attrs" /></template>
          </UiFormField>
          <UiFieldHint field-id="name">Explains the field.</UiFieldHint>
          <UiSelect aria-label="Network"><option value="testnet">Testnet</option></UiSelect>
          <UiSegmentedControl
            v-model="segment"
            aria-label="Mode"
            :options="[{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }]"
          />
          <ColorModeControl v-model="mode" />
          <UiStepper v-model="step" :steps="[{ id: 'a', label: 'Details' }, { id: 'b', label: 'Review' }, { id: 'c', label: 'Deploy' }]" />
        </section>

        <section>
          <h2>Navigation</h2>
          <AppTabNav v-model="tab" id-prefix="t" aria-label="Sections" :tabs="[{ id: 'a', label: 'Alpha' }, { id: 'b', label: 'Beta' }]" />
          <UiTabPanel id-prefix="t" tab="a"><p>Alpha content</p></UiTabPanel>
          <UiToolbar :actions="[{ id: 'home', label: 'Home' }, { id: 'help', label: 'Help' }]" />
        </section>

        <section>
          <h2>Panels</h2>
          <UiPanel title="Recent activity">
            <UiActivityFeed>
              <UiActivityItem type="Minted" time="ckpt 1" />
              <UiActivityItem type="Consumed" time="ckpt 2" datetime="2026-10-08T00:00:00Z" />
            </UiActivityFeed>
          </UiPanel>
          <UiCard title="Gate"><p>Body</p><template #footer><p>Footer</p></template></UiCard>
          <UiStatGrid>
            <UiStatRow label="Balance">12 SUI</UiStatRow>
            <UiStatRow label="Gates">3</UiStatRow>
          </UiStatGrid>
          <UiDataTable empty="Nothing yet">
            <template #head><th scope="col">Name</th><th scope="col">State</th></template>
            <tr><td>Alpha</td><td><UiBadge variant="active">Active</UiBadge></td></tr>
          </UiDataTable>
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
</style>
