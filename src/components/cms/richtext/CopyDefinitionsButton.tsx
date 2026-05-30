import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Info, Check } from 'lucide-react';

const DEFINITIONS_JSON = {
    type: 'doc',
    content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Heading 1' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Heading 2' }] },
        { type: 'paragraph', content: [
            { type: 'text', text: 'Normal text with ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
            { type: 'text', text: ', ' },
            { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
            { type: 'text', text: ', and ' },
            { type: 'text', marks: [{ type: 'textStyle', attrs: { color: '#10b981' } }], text: 'colored text' },
            { type: 'text', text: '. ' }
        ]},
        { type: 'bulletList', content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet list item 1' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet list item 2' }] }] }
        ]},
        { type: 'orderedList', attrs: { start: 1 }, content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered list item 1' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered list item 2' }] }] }
        ]},
        { type: 'blockquote', content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'This is a blockquote.' }] }
        ]},
        { type: 'codeBlock', attrs: { language: null }, content: [{ type: 'text', text: 'const foo = "bar";' }] },
        { type: 'paragraph', content: [
            { type: 'text', text: 'Inline link example: ' },
            { type: 'text', marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank', class: null } }], text: 'Click here' },
            { type: 'text', text: '. And a ' },
            { type: 'smallLinkButton', attrs: { href: '#', label: 'Small Link Button', target: '_blank', bgColor: '#10b981', textColor: '#ffffff' } }
        ]},
        { type: 'imageLinkButton', attrs: { href: '#', label: 'Image Link Button', imageUrl: 'https://via.placeholder.com/150', imageAlt: '', target: '_blank', bgColor: '#3b82f6', textColor: '#ffffff' } },
        { type: 'paragraph', content: [
            { type: 'text', marks: [{ type: 'goldenText' }], text: 'This text has a golden gradient effect.' }
        ]},
        { type: 'fileAttachment', attrs: { fileId: '', url: 'https://example.com/file.pdf', originalName: 'example.pdf', contentType: 'application/pdf', size: 1024, displayStyle: 'compact' } }
    ]
};

export const CopyDefinitionsButton: React.FC = () => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const textToCopy = JSON.stringify(DEFINITIONS_JSON, null, 2);
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // Fallback for older browsers or non-secure contexts
                const textArea = document.createElement("textarea");
                textArea.value = textToCopy;
                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";
                
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.error('Fallback: Oops, unable to copy', err);
                }
                
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-nr-text/50 hover:text-nr-accent hover:bg-nr-accent/10 transition-colors cursor-pointer"
            title={t('kb.copy_definitions', { defaultValue: 'Copy definitions' })}
        >
            {copied ? <Check size={16} className="text-green-500" /> : <Info size={16} />}
        </button>
    );
};
