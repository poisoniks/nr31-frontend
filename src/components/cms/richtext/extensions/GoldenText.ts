import { Mark, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    goldenText: {
      setGoldenText: () => ReturnType;
      toggleGoldenText: () => ReturnType;
      unsetGoldenText: () => ReturnType;
    };
  }
}

export const GoldenText = Mark.create({
  name: 'goldenText',

  addAttributes() {
    return {
      class: {
        default: 'text-gold-gradient',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.text-gold-gradient',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'text-gold-gradient' }), 0];
  },

  addCommands() {
    return {
      setGoldenText:
        () =>
        ({ commands }) => {
          return commands.setMark(this.name);
        },
      toggleGoldenText:
        () =>
        ({ commands }) => {
          return commands.toggleMark(this.name);
        },
      unsetGoldenText:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
    };
  },
});
