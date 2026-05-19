import React from 'react';
import { useTranslation } from 'react-i18next';
import { List } from 'lucide-react';

interface HeadingItem {
    id: string;
    text: string;
    level: number;
}

interface KbTableOfContentsProps {
    content?: any;
}

const KbTableOfContents: React.FC<KbTableOfContentsProps> = ({ content }) => {
    const { t } = useTranslation();

    if (!content || !content.content || !Array.isArray(content.content)) {
        return null;
    }

    const getTextFromNode = (n: any): string => {
        if (!n) return '';
        if (n.type === 'text') return n.text || '';
        return n.content?.map(getTextFromNode).join('') || '';
    };

    const headings: HeadingItem[] = [];

    content.content.forEach((node: any) => {
        if (node.type === 'heading') {
            const level = node.attrs?.level || 2;
            const text = getTextFromNode(node).trim();
            if (text) {
                // Generate identical slugified ID as TipTapRenderer
                const id = text.toLowerCase().replace(/[^\p{L}\d\s-]/gu, '').replace(/\s+/g, '-');
                headings.push({ id, text, level });
            }
        }
    });

    if (headings.length === 0) {
        return null;
    }

    const handleScroll = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Subtract header height (approx 80px) for perfect scroll position
            const yOffset = -80; 
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="glass-card rounded-xl p-4 shrink-0 w-full animate-fade-in">
            <div className="flex items-center gap-2 font-serif font-bold text-nr-text mb-3">
                <List size={18} className="text-nr-accent" />
                <span>{t('kb.article.toc')}</span>
            </div>
            <div className="h-px bg-nr-border/10 mb-3"></div>
            <nav className="flex flex-col gap-2.5">
                {headings.map((heading, index) => {
                    const indentClass = heading.level === 1
                        ? "pl-0 font-medium"
                        : heading.level === 2
                        ? "pl-3 text-sm"
                        : "pl-6 text-xs";
                    
                    return (
                        <button
                            key={index}
                            onClick={() => handleScroll(heading.id)}
                            className={`w-full text-left text-nr-text/65 hover:text-nr-accent transition-colors truncate block cursor-pointer ${indentClass}`}
                            title={heading.text}
                        >
                            {heading.text}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default KbTableOfContents;
