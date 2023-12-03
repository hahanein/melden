/** Asserts state your program assumes to be true. */
export default function invariant(state?: unknown): asserts state {
	if (state) {
		return;
	}

	throw new Error("Invariant violation");
}
