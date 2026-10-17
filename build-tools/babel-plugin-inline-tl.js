'use strict';

// Babel compiles tagged template strings to use globals, which is required by
// the spec. Unfortunately, this causes bugs when global variable names collide.
// So we inline `TL` and `eHTML` calls. Not spec compliant but we
// don't rely on that behavior.
//
// Must go before @babel/plugin-transform-template-literals.
module.exports = ({ types: t }) => ({
	name: 'inline-tl',
	visitor: {
		TaggedTemplateExpression(path) {
			const { tag, quasi } = path.node;
			const inlinable = t.isIdentifier(tag, { name: 'TL' }) || t.isIdentifier(tag, { name: 'eHTML' });
			if (!inlinable) return;
			const strings = quasi.quasis.map(q => t.stringLiteral(q.value.cooked ?? q.value.raw));
			path.replaceWith(t.callExpression(tag, [t.arrayExpression(strings), ...quasi.expressions]));
		},
	},
});
