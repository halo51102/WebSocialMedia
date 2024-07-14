import React, { useRef, useEffect, useState } from 'react';

const AutoPlayVideo = ({ src }) => {
    const videoRef = useRef(null);
    const [userInteracted, setUserInteracted] = useState(false);

    useEffect(() => {
        const handleUserInteraction = () => {
            setUserInteracted(true);
        };

        window.addEventListener('click', handleUserInteraction);
        window.addEventListener('touchstart', handleUserInteraction);

        return () => {
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchstart', handleUserInteraction);
        };
    }, []);

    useEffect(() => {
        if (userInteracted && videoRef.current) {
            const videoElement = videoRef.current;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        videoElement.play().catch((error) => {
                            console.error("Error attempting to play", error);
                        });
                    } else {
                        videoElement.pause();
                    }
                },
                { threshold: 0.5 } // Điều chỉnh ngưỡng này tùy ý
            );

            observer.observe(videoElement);

            return () => {
                if (videoElement) {
                    observer.unobserve(videoElement);
                }
            };
        }
    }, [userInteracted]);

    //   return <video ref={videoRef} src={src} width="600" height="400" controls muted />;
    return (<video ref={videoRef} width="100%" height="" controls>
        <source src={src} type="video/mp4" />
    </video>);
};

export default AutoPlayVideo;