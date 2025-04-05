module.exports = {
    skip: {
        commit: true,
        tag: true
    },
    header: '',
    parserOpts: {
        headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
        headerCorrespondence: ['type', 'scope', 'subject']
    },
    writerOpts: {
        transform(commit) {
            // Hide commits like "chore" or untyped if needed
            const allowedTypes = ['feat', 'fix', 'refactor', 'docs', 'style', 'perf'];
            if (!allowedTypes.includes(commit.type)) return;

            return {
                ...commit,
                type: null
            };
        },
        groupBy: 'type', // required to populate commitGroups
        headerPartial: '',
        mainTemplate: `### What's changed in version {{version}}

{{#each commitGroups}}
{{#each commits}}
- {{subject}}
{{/each}}
{{/each}}
  `
    }
};
