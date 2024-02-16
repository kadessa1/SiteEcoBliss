import {connexion} from "../FUNCTIONS/connection"

describe('adding a product to the cart', ()=> {
    let orderLines;
    let stockAvant;
    let stockCart;
    let stockApres;
    let authToken ;
    
    //On connecte l'utilisateur via l'API
    it('login test true', () => {
        cy.request ({
            method: 'POST',
            url:'http://localhost:8081/login',
            body: {
                username: 'test2@test.fr',
                password: 'testtest'
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('token');

            authToken = response.body.token;
        })
    })

    //On vérifie si il y a des produits dans le panier et si oui, on les supprime
    //vider(authToken);
    it('verify order lines', () => {
        cy.request({
          method: 'GET',
          url: 'http://localhost:8081/orders',
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }).then((response) => {
            expect(response.status).to.eq(200);
            orderLines = response.body.orderLines;
            orderLines.forEach(line => {
                cy.request({
                    method: 'DELETE',
                    url: 'http://localhost:8081/orders/'+line.id+'/delete',
                    headers: {
                      Authorization: `Bearer ${authToken}`
                    }
                })
            });
        }) 
    })

    it('adding a product to the cart', () => {
        connexion ()

        //On va sur la page des produits pour en sélectionner un
        cy.get ('[data-cy="nav-link-products"]').click();
        cy.get ('button').eq(2).should('contain', 'Consulter').click();

        //On vérifie la quantité en stock avant ajout au panier
        cy.wait (1000)
        cy.get('[data-cy="detail-product-stock"]').invoke('text').then((qttAvant) => {
            stockAvant = parseInt(qttAvant.split(' ')[0]);
        })

        //On ajoute au panier    
        cy.get ('[data-cy="detail-product-add"]').click();

        //On va sur le panier vérifier que le produit a bien été ajouté 
        cy.get ('[data-cy="nav-link-cart"]').click() ;
        cy.contains('Vos informations').should('exist');
        cy.contains('Vos informations').should('exist');
        cy.contains ('Poussière de lune').should('be.visible');
        cy.get('[data-cy="cart-line-quantity"]').invoke('val').then((qttCart) => {
            stockCart = parseInt(qttCart.split(' ')[0]);
        })

        //On retourne sur la page du produit pour vérifier que la quantité a bien diminué    
        cy.get ('[data-cy="nav-link-products"]').click();
        cy.get ('button').eq(2).should('contain', 'Consulter').click();
        cy.wait (1000);
        cy.get('[data-cy="detail-product-stock"]').invoke('text').then((qttApres) => {
            stockApres = parseInt(qttApres.split(' ')[0]);
            expect(stockApres+stockCart).to.equal(stockAvant);
        })  
    })

    //On connecte l'utilisateur via l'API
        it('login test true', () => {
        cy.request ({
            method: 'POST',
            url:'http://localhost:8081/login',
            body: {
            username: 'test2@test.fr',
            password: 'testtest'
            }
        }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');

        authToken = response.body.token;
        })
    })

    //On vérifie le contenu du panier via l'API
    it('verify order lines', () => {
        cy.request({
          method: 'GET',
          url: 'http://localhost:8081/orders',
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            
        }).then((response) => {
            expect(response.status).to.eq(200);
            response.body.orderLines.forEach((orderLine) => {
                if(orderLine.product.id===5 ) {
                expect(orderLine.quantity).to.be.equal(1); 
                }
            })
        })
    })

})
