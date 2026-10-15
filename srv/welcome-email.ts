import nodemailer from "nodemailer";

export type WelcomeCandidate = {
  ID: string;
  firstName: string;
  email: string;
  stardustCollection: number;
  wormholeNavigationSkill: number;
};

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "127.0.0.1",
  port: Number(process.env.SMTP_PORT ?? 1025),
  secure: false,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  socketTimeout: 10000,
});

export async function sendWelcomeEmail(
  candidate: WelcomeCandidate,
): Promise<void> {
  await transport.sendMail({
    from:
      process.env.EMAIL_FROM ?? "Galactic Spacefarer <welcome@spacefarer.test>",
    to: { name: candidate.firstName, address: candidate.email },
    subject: "Welcome aboard, Spacefarer!",
    text: [
      `Hello ${candidate.firstName},`,
      "",
      "Congratulations on starting your adventure among the stars!",
      "Your welcome bonus has been added to your starting cosmic skills.",
      "",
      `Stardust collection: ${candidate.stardustCollection}`,
      `Wormhole navigation skill: ${candidate.wormholeNavigationSkill}`,
      "",
      "Safe travels,",
      "The Galactic Spacefarer crew",
    ].join("\n"),
  });
}
