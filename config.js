const config = {
    clr_r: 1,
    clr_g: 0,
    clr_b: 0,
    resampling: true,
    resampling_rate: 50,
    smoothing: false,
    smoothing_window: 50,
    min_frequency: 40, 
    max_frequency: 150, 
    pulse_window: 20
}

const form = document.querySelector('#settings')
initForm()

function initForm() {
    form.clr_r.value = config.clr_r
    // value - number/text/email... checked - checkbox/radio
    form.clr_g.value = config.clr_g
    form.clr_b.value = config.clr_b
    form.resampling.checked = config.resampling
    form.resampling_rate.value = config.resampling_rate
    form.smoothing.checked = config.smoothing
    form.smoothing_window.value = config.smoothing_window
    form.min_frequency.value = config.min_frequency
    form.max_frequency.value = config.max_frequency
    form.pulse_window.value = config.pulse_window

}

form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (form.clr_r.value) config.clr_r = parseFloat(form.clr_r.value)
    if (form.clr_g.value) config.clr_g = parseFloat(form.clr_g.value)
    if (form.clr_b.value) config.clr_b = parseFloat(form.clr_b.value)
    if (form.resampling_rate.value) config.resampling_rate = parseFloat(form.resampling_rate.value)
    if (form.smoothing_window.value) config.smoothing_window = parseFloat(form.smoothing_window.value)
    if (form.min_frequency.value) config.min_frequency = parseInt(form.min_frequency.value)
    if (form.max_frequency.value) config.max_frequency = parseInt(form.max_frequency.value)
    if (form.pulse_window.value) config.pulse_window = parseInt(form.pulse_window.value)

    config.resampling = form.resampling.checked
    config.smoothing = form.smoothing.checked
})