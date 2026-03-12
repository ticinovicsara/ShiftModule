import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  async sendPartnerSwapRequest(
    partnerEmail: string,
    requestId: string,
    fromGroup: string,
    toGroup: string,
    requesterName: string,
  ) {
    console.log(`
      EMAIL → ${partnerEmail}
      Subject: Zahtjev za zamjenu grupe
      Body: ${requesterName} želi se zamijeniti s tobom: ${fromGroup} ↔ ${toGroup}
      Confirm link: /confirm-swap/${requestId}
    `);
  }

  async sendSwapApproved(studentEmail: string, newGroup: string) {
    console.log(`
      EMAIL → ${studentEmail}
      Subject: Zamjena grupe odobrena
      Body: Tvoj zahtjev je odobren. Nova grupa: ${newGroup}
    `);
  }

  async sendSwapRejected(studentEmail: string, reason?: string) {
    console.log(`
      EMAIL → ${studentEmail}
      Subject: Zamjena grupe odbijena
      Body: Tvoj zahtjev je odbijen. ${reason ? `Razlog: ${reason}` : ''}
    `);
  }

  async sendSwapAutoResolved(studentEmail: string, newGroup: string) {
    console.log(`
      EMAIL → ${studentEmail}
      Subject: Zamjena grupe automatski riješena
      Body: Tvoja zamjena je automatski obrađena. Nova grupa: ${newGroup}
    `);
  }

  async notifyProfessorSwapCompleted(
    professorEmail: string,
    student1Name: string,
    student2Name: string,
    group1: string,
    group2: string,
  ) {
    console.log(`
      EMAIL → ${professorEmail}
      Subject: Obavijest o zamjeni grupa
      Body: Studenti ${student1Name} i ${student2Name} su se međusobno zamijenili: ${group1} ↔ ${group2}
    `);
  }
}
