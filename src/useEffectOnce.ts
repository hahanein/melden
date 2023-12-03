import {EffectCallback, useEffect, useRef, useState} from "react";

/**
 * Like {@link useEffect} but guaranteed to execute a given effect only once on
 * mount and its destructor only once on unmount.
 *
 * @see {@link https://blog.ag-grid.com/avoiding-react-18-double-mount/}
 */
export default function useEffectOnce(effectCallback: EffectCallback): void {
	const effectCallbackRef = useRef<EffectCallback>(effectCallback);
	const destructorRef = useRef<ReturnType<EffectCallback>>();
	const effectCallbackCalledRef = useRef(false);
	const renderedRef = useRef(false);
	const setValue = useState(0)[1];

	if (effectCallbackCalledRef.current) {
		renderedRef.current = true;
	}

	useEffect(() => {
		// Only execute the effect first time around
		if (!effectCallbackCalledRef.current) {
			destructorRef.current = effectCallbackRef.current();
			effectCallbackCalledRef.current = true;
		}

		// this forces one render after the effect is run
		setValue((value) => value + 1);

		return () => {
			// If the component didn't render since the useEffect was called,
			// we know this is the test run
			if (!renderedRef.current) {
				return;
			}

			// Otherwise this is not a test, so call destructor
			if (destructorRef.current) {
				destructorRef.current();
			}
		};
	}, [setValue]);
}
