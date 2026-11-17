import { useEffect, useState } from 'react';

import * as stockage from '@/services/contenuCoffres';
import { choisirFichiers } from '@/services/selection';
import type { ElementCoffre, FichierCoffre } from '@/types/contenu';
import { ouvrirDansUneAutreApp } from '@/services/ouverture';

export function useContenuCoffre(idCoffre: string) {
    const [elements, setElements] = useState<ElementCoffre[]>([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState<string | null>(null);
    const [operationEnCours, setOperationEnCours] = useState(false);

    useEffect(() => {
        let actif = true;
        stockage
            .listerElements(idCoffre)
            .then((liste) => {
                if (actif) setElements(liste);
            })
            .catch(() => {
                if (actif) setErreur('Impossible d’ouvrir le contenu de ce coffre.');
            })
            .finally(() => {
                if (actif) setChargement(false);
            });
        return () => {
            actif = false;
        };
    }, [idCoffre]);

    async function executer(action: () => Promise<ElementCoffre[] | null>): Promise<boolean> {
        setOperationEnCours(true);
        setErreur(null);
        try {
            const liste = await action();
            if (liste) setElements(liste);
            return true;
        } catch (e) {
            setErreur(e instanceof stockage.ErreurContenu ? e.message : 'L’opération a échoué. Réessayez.');
            return false;
        } finally {
            setOperationEnCours(false);
        }
    }

    return {
        elements,
        chargement,
        erreur,
        operationEnCours,
        effacerErreur: () => setErreur(null),

        creerDossier: (nom: string, parentId: string | null) =>
            executer(() => stockage.creerDossier(idCoffre, nom, parentId)),

        /** Ouvre le sélecteur du système ; rien n'est ajouté si l'utilisateur annule. */
        importerFichiers: (parentId: string | null) =>
            executer(async () => {
                const sources = await choisirFichiers();
                let liste: ElementCoffre[] | null = null;
                for (const source of sources) {
                    liste = await stockage.ajouterFichier(idCoffre, source, parentId);
                }
                return liste;
            }),
        ouvrirAilleurs: (fichier: FichierCoffre) =>
            executer(async () => {
                await ouvrirDansUneAutreApp(idCoffre, fichier);
                return null;
            }),

        renommer: (idElement: string, nom: string) => executer(() => stockage.renommer(idCoffre, idElement, nom)),

        /** Pour un dossier, supprime aussi tout ce qu'il contient. */
        supprimer: (idElement: string) => executer(() => stockage.supprimer(idCoffre, idElement)),
    };
}
