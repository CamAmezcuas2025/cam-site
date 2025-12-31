import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/profile/', '/log-hours/', '/set-password/', '/reset-password/', '/forgot-password/', '/unauthorized/'],
      },
    ],
    sitemap: 'https://www.camamezcuas.com/sitemap.xml',
  }
}
