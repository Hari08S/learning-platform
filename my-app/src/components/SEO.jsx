import { useEffect } from 'react';

export default function SEO({ title, description, url, image }) {
    useEffect(() => {
        document.title = title ? `${title} | UPWISE` : 'UPWISE - Learning Platform';

        const setMetaTag = (name, content, property = false) => {
            if (!content) return;
            let tag = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`);
            if (!tag) {
                tag = document.createElement('meta');
                if (property) tag.setAttribute('property', name);
                else tag.setAttribute('name', name);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        setMetaTag('description', description || 'Discover world-class courses from expert instructors on UPWISE.');
        setMetaTag('og:title', title ? `${title} | UPWISE` : 'UPWISE', true);
        setMetaTag('og:description', description || 'Discover world-class courses from expert instructors on UPWISE.', true);
        setMetaTag('og:url', url || window.location.href, true);
        setMetaTag('og:image', image || `${window.location.origin}/logo.png`, true);
        setMetaTag('twitter:card', 'summary_large_image', false);
    }, [title, description, url, image]);

    return null;
}
