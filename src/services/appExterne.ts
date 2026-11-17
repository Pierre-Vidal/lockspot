let appExterneOuverte = false;

export function estDansAppExterne() {
    return appExterneOuverte;
}

export async function pendantAppExterne<T>(action: () => Promise<T>): Promise<T> {
    appExterneOuverte = true;
    try {
        return await action();
    } finally {
        appExterneOuverte = false;
    }
}