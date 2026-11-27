import type { CSSProperties, ReactNode } from "react";

/**
 * "Mode d'emploi" in the Studio: the owners' manual, where they work.
 *
 * The site is handed over without maintenance, so what is written here is
 * the help that stays. It used to be docs/client-guide.md, which nobody at
 * Moment would ever open. Here it is the first entry of the Studio, behind
 * the login, versioned with the code — a developer called in later finds it
 * and keeps it true.
 *
 * Written from what the owners want to do ("Je veux…"), not from how the
 * system is built: one card a task, numbered steps, a "Bon à savoir" box for
 * the one thing that goes wrong, and a button straight to the right screen.
 * No figure the owners can change in Shopify is repeated here (fees,
 * minimums, cut-offs): it would be the first sentence to go wrong.
 *
 * Plain markup rather than `@sanity/ui` (not a direct dependency), as in
 * ShopifyPane; the Studio's font and colours are inherited. Read-only on
 * purpose: a manual the owners can edit is a manual that gets erased.
 */
const SHOPIFY_ADMIN = "https://admin.shopify.com/store/hhfesf-40";
const shopify = (path: string) => `${SHOPIFY_ADMIN}${path}`;

/** Paragraph spacing, shared by the content below and the cards. */
const P: CSSProperties = { margin: "0 0 0.75rem" };

type Task = {
  title: string;
  /** One line under the title: when you need this. */
  when?: string;
  steps?: ReactNode[];
  body?: ReactNode;
  tip?: ReactNode;
  links?: { label: string; href: string }[];
};

type Group = { title: string; tasks: Task[] };

const GROUPS: Group[] = [
  {
    title: "Mes produits (dans Shopify)",
    tasks: [
      {
        title: "Ajouter un nouveau produit",
        steps: [
          <>
            Dans Shopify, <strong>Produits → Ajouter un produit</strong>.
          </>,
          <>
            Remplissez le <strong>titre</strong>, la{" "}
            <strong>description</strong> (quelques phrases : c&apos;est aussi ce
            que Google affiche), le{" "}
            <strong>prix TVA comprise d&apos;une pièce</strong> et au moins une{" "}
            <strong>photo</strong>.
          </>,
          <>
            <strong>Type de produit</strong> : écrivez-le exactement comme pour
            les autres — Jus pressés à froid, Boissons, Petit-déjeuner, Salades,
            Dips, Bagels &amp; Sandwiches, Toasts, Cookies, Cakes, Healthy
            snacks ou Épicerie. C&apos;est lui qui range le produit dans vos six
            familles du menu « Nos produits » (Cold Pressed Juice &amp; Drinks,
            Daily Pots, Breads &amp; Toast…). Le champ « Catégorie » de Shopify,
            lui, n&apos;est pas utilisé : vous pouvez le laisser vide.
          </>,
          <>
            <strong>Tags</strong>, en minuscules, sans accent : les régimes (
            <code>vegan</code>, <code>vegetarien</code>,{" "}
            <code>sans-gluten</code>
            ), les sélections (<code>maison</code>, <code>bureau</code>,{" "}
            <code>evenements</code>) et <code>retrait-veille</code> si le
            produit peut être retiré le lendemain.
          </>,
          <>
            En bas de la fiche, <strong>Métachamps</strong> : ingrédients,
            allergènes, traces, régime, portion, conservation, conseils de
            service, et l&apos;<strong>accroche</strong> (la petite phrase sous
            le nom, sur les cartes). Un champ vide n&apos;apparaît simplement
            pas sur le site.
          </>,
          <>
            <strong>Statut : Actif</strong>, et dans{" "}
            <strong>Canaux de vente</strong>, cochez{" "}
            <strong>Ma Boutique Headless</strong> (le canal du site).
            Enregistrez.
          </>,
        ],
        tip: (
          <>
            Le produit apparaît sur le site en une minute environ. La TVA à 6 %
            s&apos;applique toute seule : rien à faire. Pas encore prêt ?
            Laissez-le en <strong>Brouillon</strong> : il reste invisible pour
            les clients.
          </>
        ),
        links: [
          { label: "Ajouter un produit", href: shopify("/products/new") },
        ],
      },
      {
        title: "Proposer un produit en deux tailles (M / L)",
        steps: [
          <>
            Sur la fiche du produit, section <strong>Variantes</strong> →{" "}
            <strong>Ajouter des options comme la taille</strong>.
          </>,
          <>
            <strong>Une seule option</strong>, nommée <strong>Taille</strong>,
            avec deux valeurs : <strong>M</strong> et <strong>L</strong>.
          </>,
          <>
            Indiquez le <strong>prix de chaque variante</strong> (par exemple M
            9,00 €, L 12,50 €), puis Enregistrer.
          </>,
        ],
        tip: (
          <>
            Le site affiche alors « dès 9,00 € » sur les cartes et le choix M /
            L sur la fiche, avec le prix qui suit. Ne créez pas une option par
            taille (une option « M », une option « L ») : cela ne donne
            qu&apos;une seule variante. Le contenu (300 ml, 400 ml) va dans la
            description ou dans le champ Portion.
          </>
        ),
      },
      {
        title: "Bien remplir les allergènes et le régime",
        when: "À chaque nouveau produit, et à chaque changement de recette.",
        body: (
          <p style={P}>
            C&apos;est une obligation légale pour de l&apos;alimentaire, et la
            première chose que lit un client allergique. Trois règles :
          </p>
        ),
        steps: [
          <>
            Chaque allergène des ingrédients figure dans{" "}
            <strong>Allergènes</strong> (gluten, lait, œufs, fruits à coque,
            arachides, soja, sésame, céleri, moutarde, poisson, crustacés,
            mollusques, lupin, sulfites).
          </>,
          <>
            Le <strong>régime</strong> et les <strong>tags</strong> disent la
            même chose : un produit marqué « vegan » dans le texte porte aussi
            le tag <code>vegan</code>, et inversement. Le miel, le pollen, les
            œufs ou le lait ne sont pas vegan.
          </>,
          <>
            N&apos;écrivez « sans gluten » que si c&apos;est garanti, traces
            comprises. L&apos;avoine classique contient du gluten.
          </>,
        ],
        tip: (
          <>
            Les filtres de la page Nos produits (vegan, végétarien, sans gluten)
            suivent les <strong>tags</strong>, pas le texte.
          </>
        ),
      },
      {
        title: "Modifier un prix, une photo ou un texte",
        steps: [
          <>
            <strong>Produits</strong> → cliquez sur le produit.
          </>,
          <>Modifiez, puis Enregistrer.</>,
        ],
        tip: <>Le site se met à jour en une minute environ.</>,
        links: [{ label: "Mes produits", href: shopify("/products") }],
      },
      {
        title: "Retirer un produit",
        steps: [
          <>
            <strong>Pour un temps</strong> (rupture, saison) : passez-le en{" "}
            <strong>Brouillon</strong>. Il disparaît du site, et revient quand
            vous le repassez en Actif.
          </>,
          <>
            <strong>Pour toujours</strong> : en bas de la fiche,{" "}
            <strong>Supprimer le produit</strong>.
          </>,
        ],
      },
      {
        title: "Traduire mes produits en néerlandais et en anglais",
        when: "Sans traduction, le site affiche le français pour tout le monde.",
        steps: [
          <>
            Dans Shopify, <strong>Applications → Translate &amp; Adapt</strong>.
          </>,
          <>
            Choisissez la langue (néerlandais, puis anglais) et{" "}
            <strong>Produits</strong>.
          </>,
          <>
            Commencez par le <strong>titre</strong>, l&apos;
            <strong>accroche</strong> et les <strong>allergènes</strong>, puis
            la description et les autres champs.
          </>,
          <>
            Faites de même pour les <strong>collections</strong> (« Pour le
            bureau », « Salades »…).
          </>,
        ],
        tip: (
          <>
            C&apos;est aussi ce qui permet à Google de vous trouver en
            néerlandais (« catering Brussel »).
          </>
        ),
        links: [{ label: "Applications Shopify", href: shopify("/apps") }],
      },
    ],
  },
  {
    title: "Livraison et retrait (dans Shopify)",
    tasks: [
      {
        title: "Fermer pour des vacances ou un jour férié",
        steps: [
          <>
            Dans Shopify, <strong>Contenu → Métaobjets →</strong>{" "}
            <strong>Livraison — fermetures</strong> →{" "}
            <strong>Ajouter une entrée</strong>.
          </>,
          <>
            Indiquez le <strong>premier</strong> et le{" "}
            <strong>dernier jour fermé</strong> (une seule entrée pour trois
            semaines, pas une par jour). Enregistrez.
          </>,
        ],
        tip: (
          <>
            Le calendrier du site bloque ces jours en quelques minutes : plus
            personne ne peut commander pour eux. Ajoutez une fermeture dès que
            vous la connaissez. Le <strong>bandeau d&apos;annonce</strong> du
            Studio, lui, ne fait que prévenir : il ne bloque rien.
          </>
        ),
        links: [{ label: "Métaobjets", href: shopify("/content/metaobjects") }],
      },
      {
        title: "Changer les frais, les minimums ou les zones de livraison",
        body: (
          <p style={P}>
            Attention, c&apos;est le seul réglage qui se trouve à{" "}
            <strong>deux endroits</strong>, et qu&apos;il faut changer aux deux
            dans la même séance :
          </p>
        ),
        steps: [
          <>
            <strong>Ce que le site affiche</strong> : Contenu → Métaobjets →{" "}
            <strong>Livraison — zones</strong> (frais, minimum de commande,
            livraison offerte à partir de…, distance).
          </>,
          <>
            <strong>Ce que Shopify encaisse</strong> : Paramètres → Expédition
            et livraison → <strong>Livraison locale</strong> → Atelier Forest.
          </>,
        ],
        tip: (
          <>
            Si les deux ne disent pas la même chose, le client voit un prix sur
            le site et en paie un autre au paiement. N&apos;ajoutez pas de tarif
            d&apos;expédition classique (envoi postal) : il contournerait vos
            zones.
          </>
        ),
        links: [
          { label: "Métaobjets", href: shopify("/content/metaobjects") },
          {
            label: "Expédition et livraison",
            href: shopify("/settings/shipping"),
          },
        ],
      },
      {
        title: "Changer les créneaux, les horaires de retrait ou le délai",
        steps: [
          <>
            <strong>Créneaux de livraison</strong> et leur nombre de commandes
            maximum : Métaobjets → <strong>Livraison — créneaux</strong>. Mettez
            la capacité à <code>0</code> pour fermer un créneau.
          </>,
          <>
            <strong>Heures de retrait</strong> : Métaobjets →{" "}
            <strong>Retrait — horaires</strong>.
          </>,
          <>
            <strong>
              Délai de commande, heure limite, jours toujours fermés
            </strong>{" "}
            (par exemple le dimanche) : Métaobjets →{" "}
            <strong>Livraison — réglages</strong>. Les jours s&apos;écrivent en
            anglais : <code>monday</code> … <code>sunday</code>.
          </>,
        ],
        tip: (
          <>
            Modifiez les entrées qui existent déjà ; n&apos;en créez que pour un
            nouveau créneau. Le site suit en quelques minutes.
          </>
        ),
        links: [{ label: "Métaobjets", href: shopify("/content/metaobjects") }],
      },
    ],
  },
  {
    title: "Commandes et clients",
    tasks: [
      {
        title: "Voir mes commandes",
        body: (
          <p style={P}>
            Dans Shopify, <strong>Commandes</strong>. Chaque commande indique le
            mode (livraison ou retrait), le jour, le créneau, et pour une
            livraison l&apos;adresse et les précisions du client.
          </p>
        ),
        links: [{ label: "Commandes", href: shopify("/orders") }],
      },
      {
        title: "Enregistrer une commande prise par téléphone",
        when: "Pour qu'elle occupe son créneau, comme une commande du site.",
        steps: [
          <>Créez la commande dans Shopify comme d&apos;habitude.</>,
          <>
            Ajoutez-lui deux <strong>tags</strong> : le jour et l&apos;heure.
            Livraison le 7 novembre à 9 h : <code>livraison-2026-11-07</code> et{" "}
            <code>creneau-0900</code>. Retrait le 7 novembre à 11 h 30 :{" "}
            <code>retrait-2026-11-07</code> et <code>creneau-1130</code>.
          </>,
        ],
        tip: <>Annuler la commande, ou retirer ses tags, libère le créneau.</>,
      },
      {
        title: "Les demandes de devis, de contact et de compte pro",
        body: (
          <p style={P}>
            Les formulaires du site (contact, devis pour un événement,
            réservation du comptoir café, collaboration, compte professionnel)
            arrivent <strong>par e-mail</strong> dans votre boîte de contact.
            Répondez directement à l&apos;e-mail : la réponse part au client.
          </p>
        ),
      },
      {
        title: "Les paiements",
        body: (
          <p style={P}>
            Shopify → <strong>Paramètres → Paiements</strong> : les moyens de
            paiement proposés (vérifiez que <strong>Bancontact</strong> est
            activé, c&apos;est le plus utilisé en Belgique) et vos versements.
            Le paiement se fait sur <strong>shop.moment-lab.be</strong>, votre
            propre adresse.
          </p>
        ),
        links: [{ label: "Paiements", href: shopify("/settings/payments") }],
      },
    ],
  },
  {
    title: "Le contenu du site (ici, dans le Studio)",
    tasks: [
      {
        title: "Annoncer quelque chose en haut du site",
        when: "Une fermeture, une nouveauté, un événement.",
        steps: [
          <>
            Menu de gauche → <strong>Bandeau d&apos;annonce</strong>.
          </>,
          <>
            Une phrase courte, en français, et si possible aussi en néerlandais
            et en anglais (sinon le français s&apos;affiche partout). Un lien si
            vous voulez (par exemple <code>/events</code> ou <code>/shop</code>
            ).
          </>,
          <>
            Allumez <strong>Afficher le bandeau</strong>, puis{" "}
            <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Pour le retirer : éteignez l&apos;interrupteur et publiez. Le texte
            reste enregistré pour la prochaine fois.
          </>
        ),
      },
      {
        title: "Changer les horaires, le téléphone, l'e-mail ou les réseaux",
        steps: [
          <>
            Menu de gauche → <strong>Infos pratiques</strong>.
          </>,
          <>
            Modifiez ce qui a changé : téléphone, e-mail, heures
            d&apos;ouverture (au format 08:00), jours d&apos;ouverture, liens
            Instagram et Facebook. <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Ils changent partout : bas de page, menu, page Contact, et ce que
            Google affiche. Les vacances ne se mettent pas ici, mais dans les
            fermetures Shopify. L&apos;adresse et la TVA, elles, demandent un
            développeur.
          </>
        ),
      },
      {
        title: "Ajouter un partenaire sur la carte « Où nous trouver »",
        steps: [
          <>
            Menu de gauche → <strong>Où nous trouver (partenaires)</strong> → le
            crayon en haut de la colonne.
          </>,
          <>
            Nom, type d&apos;établissement, adresse, lien éventuel (site ou
            Instagram), et les{" "}
            <strong>produits Moment proposés sur place</strong> en quelques mots
            (« Cookies et jus pressés à froid »). Le point se place tout seul
            d&apos;après l&apos;adresse.
          </>,
          <>
            <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Ouvrez AME pour voir un exemple rempli. Pour masquer un partenaire
            sans le supprimer, décochez « Afficher sur la carte ».
          </>
        ),
      },
      {
        title: "Ajouter un avis client",
        when: "Un client content vous a écrit ? Avec son accord, montrez-le.",
        steps: [
          <>
            Menu de gauche → <strong>Avis clients</strong> → le crayon.
          </>,
          <>
            Ses mots tels quels (une à trois phrases), son nom comme il accepte
            d&apos;être cité (« Sophie D. »), et si vous voulez son entreprise
            ou l&apos;occasion. <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Ils défilent sur la page d&apos;accueil, sous « Ils nous font
            confiance » (le champ « Ordre d&apos;affichage » choisit
            l&apos;ordre) ; la section reste masquée tant qu&apos;il n&apos;y en
            a aucun. Uniquement de vrais avis : un avis inventé est interdit, et
            se repère.
          </>
        ),
      },
      {
        title: "Modifier « Comment ça marche & FAQ »",
        steps: [
          <>
            Menu de gauche → <strong>Comment ça marche &amp; FAQ</strong>. Le
            formulaire contient déjà les textes du site.
          </>,
          <>
            Modifiez une étape ou une question, ajoutez-en, glissez pour changer
            l&apos;ordre, ou cochez « Masquer sur le site ».
          </>,
          <>
            <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            N&apos;écrivez ni prix, ni minimum, ni délai, ni horaire dans ces
            textes : la page les affiche elle-même d&apos;après vos réglages
            Shopify, et ils restent ainsi toujours justes.
          </>
        ),
      },
      {
        title: "Publier une actualité",
        steps: [
          <>
            Menu de gauche → <strong>Actualités → Articles</strong>.
          </>,
          <>
            Le titre seul (le site ajoute « Moment »), la langue de
            l&apos;article, une accroche, une image, le texte.{" "}
            <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Un article est écrit dans une seule langue : pour les trois langues,
            il faut trois articles.
          </>
        ),
      },
      {
        title: "Changer les photos de la page d'accueil",
        steps: [
          <>
            Menu de gauche → <strong>Page d&apos;accueil</strong>.
          </>,
          <>
            Chargez la photo, puis cliquez sur l&apos;icône de recadrage («
            Rogner l&apos;image ») et placez le point important : c&apos;est lui
            qui reste visible sur téléphone. Sous la photo,{" "}
            <strong>Description de la photo</strong> : ce qu&apos;elle montre,
            en une phrase (lue aux personnes malvoyantes, et utile pour Google).{" "}
            <strong>Publier</strong>.
          </>,
          <>
            Sous la photo d&apos;ouverture, réglez{" "}
            <strong>« La photo d&apos;ouverture est… »</strong> : sombre (texte
            et menu en blanc, le réglage habituel) ou claire (texte et menu en
            noir). Avec « Sombre », gardez{" "}
            <strong>« Assombrir légèrement la photo »</strong> coché : un voile
            discret qui rend le texte et le menu lisibles partout.
          </>,
          <>
            <strong>Signature</strong> : votre phrase, affichée en petit entre
            parenthèses au centre de la photo (« Life is moments »). Laissez la
            case vide pour garder celle d&apos;aujourd&apos;hui.
          </>,
        ],
        tip: (
          <>
            Après avoir changé la photo d&apos;ouverture, ouvrez le site sur
            ordinateur et sur téléphone : la signature et le menu doivent bien
            se lire. Sinon, changez le réglage clair / sombre.
          </>
        ),
      },
      {
        title: "Changer les photos des pages Événements et Comptoir café",
        steps: [
          <>
            Menu de gauche → <strong>Page Événements</strong> ou{" "}
            <strong>Page Comptoir café</strong>.
          </>,
          <>
            Deux photos par page : la <strong>grande</strong>, à gauche sous le
            titre, et la <strong>deuxième</strong>, plus petite, à droite. Des
            photos en hauteur (portrait) conviennent le mieux.
          </>,
          <>
            Placez le point important avec l&apos;icône de recadrage, décrivez
            la photo en une phrase (<strong>Description de la photo</strong>),
            puis <strong>Publier</strong>.
          </>,
        ],
        tip: (
          <>
            Une case vide garde la photo actuelle. Pour Événements : vos tables
            et buffets ; pour le comptoir : le comptoir en service, un détail
            (une tasse, le matcha).
          </>
        ),
      },
      {
        title: "Vérifier sur le site",
        body: (
          <p style={P}>
            Après avoir publié, la petite flèche à côté de{" "}
            <strong>Publier</strong> → <strong>Voir sur le site</strong> ouvre
            la page concernée. Le site affiche la nouvelle version environ une
            minute après la publication.
          </p>
        ),
      },
    ],
  },
  {
    title: "Le reste",
    tasks: [
      {
        title: "Ce que vous ne pouvez pas changer vous-mêmes",
        body: (
          <p style={P}>
            Les textes des pages (accueil, à propos, événements, café…),
            l&apos;adresse et les informations légales (TVA, numéro
            d&apos;entreprise), les pages légales, la mise en page et toute
            nouvelle fonction demandent un développeur. Le site est livré sans
            contrat de maintenance : ces demandes se font sur devis.
          </p>
        ),
      },
      {
        title: "Être bien trouvé sur Google",
        steps: [
          <>Une vraie description et au moins une bonne photo par produit.</>,
          <>Les traductions en néerlandais et en anglais.</>,
          <>
            Une <strong>fiche Google Business</strong> (gratuite) : c&apos;est
            elle qui apparaît pour « traiteur près de moi ». Demandez un avis à
            vos clients contents : c&apos;est ce qui rassure le plus.
          </>,
          <>
            Des actualités de temps en temps : vos événements, avec quelques
            photos.
          </>,
        ],
      },
      {
        title: "Ce qui est à votre charge",
        body: (
          <ul style={{ ...P, paddingLeft: "1.25rem" }}>
            <li>Le domaine moment-lab.be (Combell), environ 15 € par an.</li>
            <li>L&apos;hébergement du site (Vercel Pro).</li>
            <li>L&apos;abonnement Shopify.</li>
            <li>
              Sanity (ce Studio), Geoapify (recherche d&apos;adresse, carte) et
              Resend (e-mails du site) : offres gratuites, normalement
              suffisantes.
            </li>
          </ul>
        ),
      },
    ],
  },
];

const card: CSSProperties = {
  border: "1px solid rgba(127, 127, 127, 0.25)",
  borderRadius: 6,
  marginBottom: "0.5rem",
};

const tipBox: CSSProperties = {
  background: "rgba(167, 197, 238, 0.18)",
  borderLeft: "3px solid #a7c5ee",
  padding: "0.6rem 0.8rem",
  margin: "0.5rem 0 0.75rem",
  borderRadius: 4,
};

const button: CSSProperties = {
  display: "inline-block",
  marginRight: "0.5rem",
  marginTop: "0.25rem",
  padding: "0.35rem 0.75rem",
  border: "1px solid currentColor",
  borderRadius: 4,
  fontWeight: 600,
  fontSize: "0.875rem",
  textDecoration: "none",
};

function TaskCard({ task }: { task: Task }) {
  return (
    <details style={card}>
      <summary
        style={{
          cursor: "pointer",
          padding: "0.75rem 0.9rem",
          fontWeight: 600,
          listStylePosition: "inside",
        }}
      >
        {task.title}
      </summary>
      <div style={{ padding: "0 0.9rem 0.9rem" }}>
        {task.when && (
          <p style={{ ...P, opacity: 0.7, fontSize: "0.9rem" }}>{task.when}</p>
        )}
        {task.body}
        {task.steps && (
          <ol style={{ ...P, paddingLeft: "1.25rem" }}>
            {task.steps.map((step, index) => (
              <li key={index} style={{ marginBottom: "0.4rem" }}>
                {step}
              </li>
            ))}
          </ol>
        )}
        {task.tip && (
          <div style={tipBox}>
            <strong>Bon à savoir.</strong> {task.tip}
          </div>
        )}
        {task.links && (
          <div>
            {task.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={button}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}

export function GuidePane() {
  return (
    <div
      style={{
        padding: "1.5rem",
        maxWidth: "46rem",
        lineHeight: 1.55,
        fontSize: "0.95rem",
      }}
    >
      <h2 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem" }}>
        Mode d&apos;emploi
      </h2>
      <p style={P}>
        Tout ce qu&apos;il faut pour faire vivre le site vous-mêmes. Cliquez sur
        ce que vous voulez faire.
      </p>
      <p style={{ ...P, opacity: 0.75 }}>
        En bref : les <strong>produits, prix, commandes et la livraison</strong>{" "}
        se gèrent dans <strong>Shopify</strong> ; les{" "}
        <strong>
          photos, bandeau, infos pratiques, FAQ, avis, actualités et partenaires
        </strong>{" "}
        ici, dans le Studio.
      </p>

      {GROUPS.map((group) => (
        <section key={group.title} style={{ marginTop: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              opacity: 0.7,
              margin: "0 0 0.6rem",
            }}
          >
            {group.title}
          </h3>
          {group.tasks.map((task) => (
            <TaskCard key={task.title} task={task} />
          ))}
        </section>
      ))}
    </div>
  );
}
