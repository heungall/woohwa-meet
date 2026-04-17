export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => {
    const escape: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
    }
    return escape[char]
  })
}

export function validateCarNumber(carNumber: string): boolean {
  const pattern = /^[0-9]{2,3}[가-힣][0-9]{4}$/
  return carNumber === '' || pattern.test(carNumber.replace(/\s/g, ''))
}

export function validatePhoneSuffix(suffix: string): boolean {
  return /^\d{4}$/.test(suffix)
}

export function sanitizeInput(input: string): string {
  return escapeHtml(input.trim().slice(0, 200))
}
