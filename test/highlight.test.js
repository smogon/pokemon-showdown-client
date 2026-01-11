const assert = require('assert').strict;

// test implementation matching panel-chat.tsx logic
function shouldNotifyHighlight({
	isHistory,
	authorUserid,
	currentUserid,
	highlightMatches,
}) {
	if (authorUserid === currentUserid) return false;
	if (isHistory) return false;
	return highlightMatches;
}

describe('Highlight Notifications', () => {

	describe('shouldNotifyHighlight', () => {

		it('should not notify for history/backlog messages even when highlight matches', () => {
			const result = shouldNotifyHighlight({
				isHistory: true,
				authorUserid: 'otheruser',
				currentUserid: 'testuser',
				highlightMatches: true,
			});
			assert.strictEqual(result, false);
		});

		it('should not notify for self-authored messages even when highlight matches', () => {
			const result = shouldNotifyHighlight({
				isHistory: false,
				authorUserid: 'testuser',
				currentUserid: 'testuser',
				highlightMatches: true,
			});
			assert.strictEqual(result, false);
		});

		it('should not notify for self-authored history messages', () => {
			const result = shouldNotifyHighlight({
				isHistory: true,
				authorUserid: 'testuser',
				currentUserid: 'testuser',
				highlightMatches: true,
			});
			assert.strictEqual(result, false);
		});

		it('should notify for live messages from other users when highlight matches', () => {
			const result = shouldNotifyHighlight({
				isHistory: false,
				authorUserid: 'otheruser',
				currentUserid: 'testuser',
				highlightMatches: true,
			});
			assert.strictEqual(result, true);
		});

		it('should not notify for live messages when highlight does not match', () => {
			const result = shouldNotifyHighlight({
				isHistory: false,
				authorUserid: 'otheruser',
				currentUserid: 'testuser',
				highlightMatches: false,
			});
			assert.strictEqual(result, false);
		});

		it('should not notify when current user is not yet known (empty userid)', () => {
			const result = shouldNotifyHighlight({
				isHistory: false,
				authorUserid: 'someuser',
				currentUserid: '',
				highlightMatches: true,
			});
			assert.strictEqual(result, true);
		});

		it('should not notify for history when current user is not yet known', () => {
			const result = shouldNotifyHighlight({
				isHistory: true,
				authorUserid: 'someuser',
				currentUserid: '',
				highlightMatches: true,
			});
			assert.strictEqual(result, false);
		});

	});

});
