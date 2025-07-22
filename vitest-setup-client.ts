/// <reference types="@vitest/browser/matchers" />
/// <reference types="@vitest/browser/providers/playwright" />

import { vi } from 'vitest'

// Mock $app/state for all tests
vi.mock('$app/state', () => ({
	page: {
		url: {
			pathname: '/test'
		}
	}
}))
