---
date: 2026-10-16
title: "Privacy"
description: "How Verba Manent handles your data: recordings stay on your computer, no biometric data, no AI training."
---

<div class="bozza"><b>Draft.</b> This text must be reviewed by a privacy expert before publication.</div>

<div class="evid">

**In short**

- Recordings, transcripts and notes stay **on your computer**. We don't receive them and we don't keep them.
- **No biometric data.** “Who's speaking” tells voices apart only while it works, then deletes every trace. Verba Manent keeps no voiceprint.
- Your lectures and meetings are **never used to train** any artificial intelligence.

</div>

{{< vm-schermata img="prima-di-iniziare-en" didascalia="On first start Verba Manent sums all this up in a box, which you can read again anytime in Settings › Privacy." >}}

## Data controller

Sara Boldrini, trading as Punto Web Ferrara  
Ostellato (FE), Italy  
Email: [info@puntowebferrara.com](mailto:info@puntowebferrara.com)

## What stays on your computer

Audio and video recordings, transcripts, notes, flashcards, the names you give to voices and your settings all stay in a folder of your choice on your computer. Your Claude key, if you use one, is stored on your computer and protected by the operating system.

## What leaves your computer, and where it goes

| What | To whom | Why |
|---|---|---|
| The **text** of the transcript (never the audio) | Anthropic, provider of the Claude AI | To create your notes. With a subscription, the text passes through our server, which forwards it and **does not keep it** |
| The **audio**, only if you choose «On the server» in Settings › Where I transcribe | Your own transcription server on RunPod (your account, in Europe) | For faster transcription. The server deletes the audio when the work is done. This option is off by default and the audio never leaves your computer |
| A **copy** of notes, transcript and, if you choose, audio, **only if you turn on «Copy to the cloud»** | Your own Google Drive, OneDrive or a folder you choose | To find your lectures from your phone or another computer. We see nothing: it's your own space |
| Lessons, notes and reviews, **only if you link your phone to a computer with «Sync»** (Wi-Fi) | Straight to your other device, on your home network or the phone's hotspot | To have the same lessons on PC and phone. It goes through no internet and no server of ours |
| Lessons packed in **password-protected zips**, **only if you turn on «Sync away from home»** | Your own Google Drive or OneDrive | To sync PC and phone even when they are far apart. Without the password nobody can open the zips, not Google, Microsoft or us. See below |
| Your **Gmail address**, only if the free trial is on or you have a subscription (including «Complimentary» or family) | Our site verbamanent.app | To know how many trial days you have left, or whether Claude is included for you. See «Free trial and subscription» below |
| Technical error reports, **only if you agree** (you can change your mind in Settings › Privacy) | Sentry, with data in Europe (Germany) | To fix problems. They only contain where in the program the error happened, the version and the type of computer. Never recordings, transcripts, notes, file or people names, keys |

## Google Drive and OneDrive («Sync away from home»)

If you turn this on, you sign in with your Google or Microsoft account and give Verba Manent the **smallest possible permission**:

- **Google Drive:** Verba Manent sees and manages **only the files it creates** (the «drive.file» permission), i.e. the «Verba Manent IA» folder. It does not see, read or change any other file in your Drive. It also reads your **email address**, only to show you which account is linked.
- **OneDrive:** Verba Manent uses **only its own folder** (Apps › Verba Manent IA) and reads your user name or email for the same reason.

What Verba Manent puts in your cloud: one zip per lesson and one for your study data, **encrypted with AES-256** using a password created on your device, plus a list of lessons (also encrypted) and an instructions file. The zips have **a code instead of a name**: anyone looking at your Drive can't see which lessons you have.

Access to your cloud stays **only on your devices**: we don't receive it and we have no servers that read your Drive or OneDrive. When you link your phone to your PC with the QR code, the PC hands over access and password directly, on your network. We don't use your cloud data for advertising, we don't sell it and we don't use it to train AI.

You can remove the permission at any time: in Verba Manent with «Unlink the cloud», or from your account ([Google](https://myaccount.google.com/permissions), [Microsoft](https://account.live.com/consent/Manage)). The zips stay in your cloud until you delete them.

Verba Manent IA's use and transfer to any other app of information received from Google APIs will adhere to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

## Free trial and subscription

**What we keep on our site** (Cloudflare storage):

- **Free trial:** your Gmail address, the day you started the trial and the last day you used the app.
- **Subscription** (including «Complimentary» and family): your Gmail address, plan, since when you have it, any expiry date and the monthly Claude cap.
- **Included Claude usage:** for each day, how many questions you asked Claude and what they cost (deleted automatically after about 13 months). **We do not keep the content** of questions or answers: the text passes through our site only to reach Anthropic, then is stored nowhere. Anthropic receives it with our key, not yours: it does not know who you are.

**Why:** to provide the service you asked for (counting trial days, knowing whether Claude is included for you, applying the monthly cap). The legal basis is our contract with you.

**For how long:** while you are on the trial or subscribed, then for 12 months after it ends, so we can recognise you if you come back. Then it is deleted automatically. You can ask us to delete it sooner by writing to [info@puntowebferrara.com](mailto:info@puntowebferrara.com).

{{% solo-vendita %}}
**If you subscribe and pay**, we also keep the subscription status (active or cancelled), the renewal date, the card type and last 4 digits, and the codes Lemon Squeezy uses to identify your subscription.

**Lemon Squeezy** (Lemon Squeezy LLC, part of the Stripe group) sells the subscription as *merchant of record*. For payment it is an **independent controller** of your data: it receives your name, email, country and payment details, processes them under [its privacy policy](https://lemonsqueezy.com/privacy) and keeps receipts for as long as tax law requires. Lemon Squeezy is based in the United States: the data transfer is covered by the safeguards required by the GDPR. We never receive your card details.
{{% /solo-vendita %}}

## “Who's speaking” and your voice

To tell speakers apart, Verba Manent compares voices **only within the same recording and only while processing it**. When it's done, every trace of the voice is deleted: the file only keeps a label such as “Voice 1 = Lecturer”. Verba Manent does not recognise people from one recording to the next and keeps no voiceprints.

## Other people you record

When you record lectures or meetings, you also record other people's voices. Getting permission to record is up to you: many universities have specific rules and lecturers have rights over their lectures. Every time you record, Verba Manent offers a ready-made message to let the other participants know.

## This website

If you join the waiting list we keep your email and the use you select, only to tell you when the app is released. You can ask us to delete it at any time. The site's visitor statistics use no cookies. The «My subscription» page and Verba Manent on the web use Google sign-in to learn your Gmail address; the site sets no cookie for this.

## Your rights

You can ask at any time to access, correct or delete your data, and you can lodge a complaint with your data protection authority. For requests, write to [info@puntowebferrara.com](mailto:info@puntowebferrara.com).
