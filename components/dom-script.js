const closeModals = () => {
    const closeModal = document.querySelector('.ivu-modal-wrap.announcement-modal')
    if(closeModal){
        closeModal.style.display = 'none'
    }
    const closeModalMask = Array.from( document.querySelectorAll('.ivu-modal-mask') ).filter( (el) => el.style.display === '' )[0]
    if(closeModalMask){
        closeModalMask.style.display = 'none'
    }
}