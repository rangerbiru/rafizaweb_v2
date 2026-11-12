import { component, defineMarkdocConfig, nodes } from '@astrojs/markdoc/config';

export default defineMarkdocConfig({
  nodes: {
    heading: { ...nodes.heading, render: component('./src/components/article/Heading.astro') },
    table: { ...nodes.table, render: component('./src/components/article/Table.astro') },
  },
});
