// 메인 엔드포인트 — Google Apps Script 진입점

function doGet(e) {
  return response({ status: 'WOOHWA API OK' });
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = String(params.action || '');

    switch (action) {
      // ── 인증 ──────────────────────────────────────────
      case 'verifyPassword': {
        const ok = verifyPassword(String(params.password || ''));
        return response({ verified: ok });
      }

      case 'getCoaches': {
        return response(getActiveCoaches());
      }

      case 'selectCoach': {
        const result = selectCoach(
          String(params.coachId || ''),
          params.phoneSuffix ? String(params.phoneSuffix) : undefined
        );
        return response(result);
      }

      // ── 예약 ──────────────────────────────────────────
      case 'getWeeklyReservations': {
        const data = getWeeklyReservations(
          String(params.weekStart || ''),
          String(params.coachId || '')
        );
        return response(data);
      }

      case 'createReservation': {
        const created = createReservation(
          String(params.coachId || ''),
          params.slots,
          params.carNumber ? String(params.carNumber) : undefined
        );
        return response(created);
      }

      case 'cancelReservation': {
        cancelReservation(
          String(params.reservationId || ''),
          String(params.coachId || '')
        );
        return response(null);
      }

      case 'getBlockedSlots': {
        return response(getBlockedSlots(String(params.weekStart || '')));
      }

      case 'getGuideContent': {
        return response(getGuideContent());
      }

      // ── 관리자 ────────────────────────────────────────
      case 'verifyAdmin': {
        const email = verifyAdminToken(String(params.token || ''));
        return response({ valid: !!email });
      }

      case 'adminGetReservations': {
        return response(adminGetReservations(
          String(params.token || ''),
          params.from ? String(params.from) : undefined,
          params.to ? String(params.to) : undefined
        ));
      }

      case 'adminCancelReservation': {
        adminCancelReservation(String(params.token || ''), String(params.reservationId || ''));
        return response(null);
      }

      case 'adminGetCoaches': {
        return response(adminGetCoaches(String(params.token || '')));
      }

      case 'adminCreateCoach': {
        return response(adminCreateCoach(String(params.token || ''), params.coach));
      }

      case 'adminUpdateCoach': {
        adminUpdateCoach(
          String(params.token || ''),
          String(params.coachId || ''),
          params.updates
        );
        return response(null);
      }

      case 'adminGetBlockedSlots': {
        return response(adminGetBlockedSlots(String(params.token || '')));
      }

      case 'adminCreateBlockedSlot': {
        return response(adminCreateBlockedSlot(String(params.token || ''), params.slot));
      }

      case 'adminDeleteBlockedSlot': {
        adminDeleteBlockedSlot(String(params.token || ''), String(params.slotId || ''));
        return response(null);
      }

      case 'adminGetSettings': {
        return response(adminGetSettings(String(params.token || '')));
      }

      case 'adminUpdatePassword': {
        adminUpdatePassword(String(params.token || ''), String(params.newPassword || ''));
        return response(null);
      }

      case 'adminUpdateGuideContent': {
        adminUpdateGuideContent(String(params.token || ''), String(params.content || ''));
        return response(null);
      }

      default:
        return errorResponse('알 수 없는 요청입니다.');
    }
  } catch (err) {
    // 내부 오류는 클라이언트에 상세 정보 노출 금지
    console.error('Error:', err.message, err.stack);
    return errorResponse(err.message || '요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
}
