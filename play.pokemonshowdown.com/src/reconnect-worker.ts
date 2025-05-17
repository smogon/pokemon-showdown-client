let interval: number | null = null;

self.onmessage = (e: MessageEvent) => {
	if (e.data === 'start') {
		if (interval === null) {
			console.log("Attempting to reconnect in 5 seconds..");
			interval = setInterval(() => {
				postMessage('reconnect-check');
			}, 5000); // or do we want it immediately
		}
	} else if (e.data === 'stop') {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;
		}
	}
};
