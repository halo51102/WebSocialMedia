import "./modalEmotion.css";
import React from "react";

const ModalEmotion = ({ show, handleClose, handleEmotionSelect, index, overlayPosition }) => {
    const modalDisplay = show ? 'block' : 'none'
    const selectEmotion = (e) => {
        handleEmotionSelect(e, index);
        handleClose();
    }

    return (
        <div className="message-reaction-container" style={{top: `${overlayPosition.top}px`, right: `-10000px`, left:`${overlayPosition.left}px`, position: "absolute"}}>
            <div className="message-row-reactions" tabIndex="-1">
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/tf3/2/32/2764.png" alt="❤" onClick={(e) => selectEmotion(e)}/>
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t2d/2/32/1f606.png" alt="😆" onClick={(e) => selectEmotion(e)}/>
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t1a/2/32/1f62e.png" alt="😮" onClick={(e) => selectEmotion(e)}/>
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t67/2/32/1f622.png" alt="😢" onClick={(e) => selectEmotion(e)}/>
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t65/2/32/1f620.png" alt="😠" onClick={(e) => selectEmotion(e)}/>
            <img height="32" width="32" src="https://static.xx.fbcdn.net/images/emoji.php/v9/t55/2/32/1f44d.png" alt="👍" onClick={(e) => selectEmotion(e)}/>
            </div>
        </div>  
    )
}

export default ModalEmotion;