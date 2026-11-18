# UI translations

Use `` TL`text` `` or `` TL("text", "context") `` for text that should be translated. `` TL`stuff ${num} stuff ${text} text` `` is also supported, and will be numbered and can be rearranged.

When running `node build translations`, this will update `en-template.ts` with a new translation entry. Manually review (and maybe edit) `en-template.ts` to your liking, then run `node build translations --sync` to add it to every individual language file and mark it as needing translation.

The sync command will also sync any comment starting with `// TRANSLATORS:`. These should be added to `en-template.ts`, comments in other files will be overwritten. Other comments only exist in their individual translation files, and won't be synced.
