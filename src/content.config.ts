import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Ogni file in src/content/alloggi/ è una sistemazione. Per togliere una
// sistemazione dal sito basta cancellare il suo file (o mettere attivo: false).
const alloggi = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/alloggi' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      sede: z.enum(['marciano', 'santa-maria']),
      piano: z.string(),
      posti: z.string(),
      breve: z.string(),
      dotazioni: z.array(z.string()),
      foto: image(),
      ordine: z.number(),
      attivo: z.boolean().default(true),
    }),
});

export const collections = { alloggi };
