/**
 * Test inline search functionality
 */
function testInlineSearch() {
  // Test the search API directly
  const testQuery = 'trouser';
  
  console.log('Testing search for:', testQuery);
  
  const url = new URL(window.location.origin + '/search/suggest.json');
  url.searchParams.set('q', testQuery);
  url.searchParams.set('resources[type]', 'product');
  url.searchParams.set('resources[limit]', '6');
  
  fetch(url)
    .then(response => {
      console.log('Response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Search results:', data);
      console.log('Products found:', data.resources?.results?.products?.length || 0);
    })
    .catch(error => {
      console.error('Search error:', error);
    });
}

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testInlineSearch = testInlineSearch;
  console.log('Inline search test function available. Run: testInlineSearch()');
}
