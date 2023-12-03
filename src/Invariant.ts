/** Asserts state your program assumes to be true. */
export default function invariant(state?: unknown): asserts state {
	if (state == false) {
		throw new Error("Invariant violation");
	}
}
