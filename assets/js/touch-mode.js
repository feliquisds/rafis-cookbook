const pointerModeRoot = document.documentElement

window.installTouchPressState = function (touchActiveSelector) {
    let touchActiveElement = null

    function clearTouchActive() {
        if (touchActiveElement != null) {
            touchActiveElement.classList.remove('touch-active')
            touchActiveElement = null
        }
    }

    addEventListener("pointerdown", (event) => {
        if (event.pointerType === "touch") {
            pointerModeRoot.dataset.pointerMode = "touch"
            clearTouchActive()

            const target = event.target.closest(touchActiveSelector)
            if (target != null) {
                touchActiveElement = target
                target.classList.add('touch-active')
            }
        } else if (event.pointerType === "mouse" || event.pointerType === "pen") {
            delete pointerModeRoot.dataset.pointerMode
            clearTouchActive()
        }
    }, { passive: true })

    addEventListener('pointerup', clearTouchActive, { passive: true })
    addEventListener('pointercancel', clearTouchActive, { passive: true })
}