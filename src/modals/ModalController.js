import React, {useState} from 'react'
import {Modal,Form,Button} from 'react-bootstrap'

const ModalController  = ({modal, modalProps, children}) => {
    
    const [showModal, setShowModal] = useState(false)
  
    return (
        <>
            {showModal && React.createElement(modal, {...modalProps, show: true, onClose: () => setShowModal(false)})}
            <div onClick={() => setShowModal(true)}>
                {children}
            </div>
      </>
    );
}

export default ModalController