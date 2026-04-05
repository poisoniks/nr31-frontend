import React from 'react';

const Profile: React.FC = () => {
    return (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 mt-16">
            <h1 className="text-3xl font-serif font-bold text-nr-text mb-6">My Profile</h1>
            <div className="card max-w-2xl">
                <p className="text-secondary mb-4">This is a dummy profile page.</p>
                {/* Future implementation goes here */}
                <div className="h-48 border-2 border-dashed border-nr-border/50 rounded-lg flex items-center justify-center text-nr-text/50">
                    Profile settings will be added later.
                </div>
            </div>
        </div>
    );
};

export default Profile;
