'use client';

import { clearAuthUser } from '@/features/auth/client';
import { http } from '@/lib/http';

export const httpClient = http.extend({
  hooks: {
    afterResponse: [
      (_request, _options, response) => {
        if (response.status === 401) {
          clearAuthUser();
        }
        return response;
      },
    ],
  },
});
