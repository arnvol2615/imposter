import React from 'react'

export default function SpyfallDescriptionNO() {
  return (
    <div>
      <div>
        Så gøy at du spør om <b>Spyfall</b>! Det er et veldig populært og underholdende partyspill som går ut på bløffing og å stille de riktige (og feil) spørsmålene.
        <hr />
        <h3>🕵️ Slik Spilles Spyfall</h3>
        <p>Spyfall spilles over flere korte runder, vanligvis med 3 til 8 spillere.</p>
        <h4>1. Oppsett av runden</h4>
        <ul>
          <li>Alle spillere får et kort.</li>
          <li><b>Ikke-spionene</b> får et kort som viser samme <b>hemmelige sted</b> og en unik <b>rolle</b> på det stedet.</li>
          <li><b>Én spiller</b> får et kort hvor det kun står <b>"Spion"</b>. Spionen vet ikke stedet.</li>
        </ul>
        <h4>2. Mål</h4>
        <table><thead><tr><th>Spillergruppe</th><th>Mål</th></tr></thead><tbody><tr><td><b>Ikke-spioner</b></td><td>Å identifisere og anklage Spionen <b>før</b> Spionen gjetter stedet.</td></tr><tr><td><b>Spionen</b></td><td>Å lytte og identifisere stedet, samtidig som de unngår mistanke.</td></tr></tbody></table>
        <h4>3. Spørsmål og Svar</h4>
        <ul>
          <li>En tidsbegrenset runde starter (ofte 8 minutter).</li>
          <li>Spillerne bytter på å stille spørsmål om stedet.</li>
          <li><b>Ikke-spionene</b> må være spesifikke nok til å vise at de vet stedet, men vage nok til å ikke røpe det.</li>
          <li><b>Spionen</b> må svare forsiktig og stille lure spørsmål for å blande seg.</li>
        </ul>
        <blockquote><b>Eksempel:</b> Hvis stedet er "Sirkus", spør: "Hvorfor er du kledd så rart?"</blockquote>
        <h4>4. Avslutning</h4>
        <ol>
          <li><b>Anklagelse:</b> Hvem som helst kan anklage; hvis alle er enige, avslør kortet. Spion = borgere vinner; feil = spion vinner.</li>
          <li><b>Spionen gjetter stedet:</b> Riktig = spion vinner; feil = borgere vinner.</li>
          <li><b>Tiden renner ut:</b> Avslutt med avstemning; riktig = borgere vinner; feil/ingen enighet = spion vinner.</li>
        </ol>
      </div>

      <hr />
      <div>
        <p>Det er vanligvis en bestemt struktur i spillet, men det er rom for fleksibilitet!</p>
        <h3>🔄 Spørsmålsrunden: En Kombinasjon av Struktur og Frihet</h3>
        <p>Spillet starter med at en valgt spiller stiller et spørsmål til en annen spiller. Etter det følger spørsmålene en bestemt rekkefølge, ofte med klokka, men med en viktig vri:</p>
        <ul>
          <li><b>1. Styre rekkefølgen:</b> Den spilleren som nettopp <b>svarte</b> på spørsmålet, er nå den som skal stille det <b>neste</b> spørsmålet.
            <div style={{opacity:0.85}}>Eksempel: Alice spør Ben. Når Ben har svart, er det <b>Ben</b> sin tur til å velge hvem han vil stille spørsmål til (f.eks. Claire). Når Claire har svart, er det <b>Claire</b> sin tur, og så videre.</div>
          </li>
          <li><b>2. Velge mottaker fritt:</b> Den som har tur til å spørre, kan velge <b>hvem som helst</b> ved bordet (inkludert den som nettopp spurte dem) som mottaker av spørsmålet.</li>
        </ul>
        <p>Dette skaper en dynamisk flyt og forhindrer at spørsmålene går i en monoton ring, samtidig som det sikrer at alle får en tur.</p>

        <h3>🛑 Unntak: Når du kan avbryte (Konfrontasjon)</h3>
        <p>Den eneste gangen en spiller kan avbryte den vanlige spørsmålsflyten er når de ønsker å <b>konfrontere</b> Spionen eller <b>gjette</b> stedet:</p>
        <ul>
          <li><b>Anklagelse:</b> En hvilken som helst spiller kan stoppe klokken og anklage en bestemt person for å være Spionen.</li>
          <li><b>Gjetting:</b> Spionen kan stoppe klokken og prøve å gjette det hemmelige stedet.</li>
        </ul>
        <p>Så, selve spørsmålene går i en strukturert, men flytende rekkefølge (den som svarer spør nestemann), mens <b>konfrontasjon</b> kan skje når som helst.</p>

        <p>Er du interessert i å høre mer om hvilke typer spørsmål som er lurest å stille som ikke-spion?</p>
      </div>
    </div>
  )
}
