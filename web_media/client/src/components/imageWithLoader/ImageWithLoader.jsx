import React, { useState } from 'react';
// import './ImageWithLoader.css'; // Import CSS for loader styles
import {
    LoadingOutlined
} from '@ant-design/icons';

const ImageWithLoader = ({ src, alt, onClick }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleImageLoad = () => {
        setLoading(false);
    };

    const handleImageError = () => {
        setLoading(false);
        setError(true);
    };

    // return (
    //     <div className="image-container">
    //         {loading && !error && <div className="loader">Loading...</div>}
    //         {error && <div className="error">Failed to load image</div>}
    //         <img
    //             src={src}
    //             alt={alt}
    //             onLoad={handleImageLoad}
    //             onError={handleImageError}
    //             style={{ display: loading || error ? 'none' : 'block' }}
    //         />
    //     </div>
    // );

    return( <div>
        {loading && !error &&
            <div className="loading">
                <LoadingOutlined style={{ fontSize: '30px' }} />
            </div>}
        {error && <div className="error">Failed to load image</div>}
        <img src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={onClick}
            style={{ display: loading || error ? 'none' : 'block' }}
        />
    </div>)
};

export default ImageWithLoader;
