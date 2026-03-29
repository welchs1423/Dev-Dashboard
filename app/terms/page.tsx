import Link from 'next/link';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-gray-800 leading-relaxed">
      <h1 className="text-3xl font-bold mb-8">이용약관</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
        <p>본 약관은 Dev Dashboard(이하 "서비스")가 제공하는 정보 큐레이션 서비스의 이용과 관련하여, 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">제2조 (서비스의 제공 및 변경)</h2>
        <p>1. 서비스는 타 채용 포털의 공개된 API를 활용하여 채용 정보를 수집 및 가공하여 제공합니다.</p>
        <p>2. 서비스에서 제공하는 데이터의 정확성, 완전성에 대해 보증하지 않으며, 이로 인해 발생하는 어떠한 손해에 대해서도 책임을 지지 않습니다. 최종 확인은 반드시 원본 채용 사이트를 통해 진행해야 합니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">제3조 (저작권 및 정보의 이용)</h2>
        <p>1. 서비스 내에서 제공되는 채용 공고의 원본 데이터에 대한 저작권은 해당 기업 및 원본 채용 플랫폼에 있습니다.</p>
        <p>2. 이용자는 서비스를 통해 얻은 정보를 영리 목적으로 무단 복제, 전송, 출판, 배포할 수 없습니다.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">제4조 (광고의 게재)</h2>
        <p>서비스는 운영을 위해 구글 애드센스 등의 타사 광고를 게재할 수 있습니다. 이 과정에서 광고주가 쿠키를 사용할 수 있으며, 서비스는 제3자가 제공하는 광고 내용에 대해 책임을 지지 않습니다.</p>
      </section>

      <footer className="mt-12 pt-8 border-t text-sm text-gray-500">
        <p>시행 일자: 2026년 3월 29일</p>
        <Link href="/" className="text-blue-600 hover:underline mt-4 block">
          메인 페이지로 돌아가기
        </Link>
      </footer>
    </div>
  );
}