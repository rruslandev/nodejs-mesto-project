const urlRegex = /^(https?:\/\/)(www\.)?[\w-]+\.[\w.~:/?#[\]@!$&'()*+,;=-]+#?$/

const validateUrl = (url: string): boolean => urlRegex.test(url)

export default validateUrl
