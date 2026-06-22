import type { PasswordEntry } from './types'

const ALGORITHM = 'AES-GCM'
const KEY_LENGTH = 256
const PBKDF2_ITERATIONS = 310_000

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array<ArrayBuffer> {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

async function deriveKey(
  masterPassword: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptPassword(
  plaintext: string,
  masterPassword: string,
): Promise<{
  encrypted_password: string
  iv: string
  kdf_salt: string
}> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(masterPassword, salt)
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    new TextEncoder().encode(plaintext),
  )

  return {
    encrypted_password: bytesToBase64(new Uint8Array(ciphertext)),
    iv: bytesToBase64(iv),
    kdf_salt: bytesToBase64(salt),
  }
}

export async function decryptPassword(
  entry: Pick<PasswordEntry, 'encrypted_password' | 'iv' | 'kdf_salt'>,
  masterPassword: string,
): Promise<string> {
  try {
    const salt = base64ToBytes(entry.kdf_salt)
    const iv = base64ToBytes(entry.iv)
    const ciphertext = base64ToBytes(entry.encrypted_password)
    const key = await deriveKey(masterPassword, salt)
    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext,
    )

    return new TextDecoder().decode(plaintext)
  } catch {
    throw new Error('Unable to decrypt. Check your master password.')
  }
}
