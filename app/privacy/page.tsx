export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. 수집하는 개인정보 항목</h2>
        <p>본 서비스는 별도의 회원가입 절차가 없으며, 사용자의 개인정보를 수집하거나 저장하지 않습니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. 개인정보의 이용 목적</h2>
        <p>제공되는 모든 채용 정보는 공개된 API(점핏)를 바탕으로 하며, 사용자에게 편의를 제공하는 목적으로만 사용됩니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. 쿠키(Cookie) 및 광고 실행</h2>
        <p>본 서비스는 향후 구글 애드센스 등 제3자 광고 서비스를 이용할 수 있으며, 이 과정에서 광고주가 사용자의 브라우저에 쿠키를 설치하거나 읽을 수 있습니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. 데이터 출처 및 저작권</h2>
        <p>본 서비스에서 제공하는 채용 정보의 저작권은 원작자 및 점핏(Jumpit)에 있습니다. 본 서비스는 정보 전달의 매개체 역할만 수행합니다.</p>
      </section>

      <footer className="mt-12 pt-8 border-t text-sm text-gray-500">
        <p>시행 일자: 2026년 3월 29일</p>
        <a href="/" className="text-blue-600 hover:underline mt-4 block">메인 페이지로 돌아가기</a>
      </footer>
    </div>
  );
}