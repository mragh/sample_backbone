/**
  *  Really basic example of using Backbone. Not meant to necessarily illustrate the 
  *  *right* way to do Backbone, but just to show how models, views, and collections
  *  can play together.
  *
  */
"use strict";

//the main (only) Model here
var Order = Backbone.Model.extend({
        defaults: function() {
          return {
            orderNumber: "",
            orderStatus: "",
            name: "",
            total: 0,
            selected: false
          };
        },
    }
    );

//simple Model collection for Orders
var OrderList = Backbone.Collection.extend({
    model: Order,
    url: "orders.json",
    processSelections: function(newStatus) {
        var selectedOrders = this.where({selected: true});
        _.each(selectedOrders, function(order){
            order.set({selected: false, orderStatus: newStatus});
        });
    }
});

//View for each order/row
var OrderLineItemView = Backbone.View.extend({
    tagName: "tr",
    events: 
    {
        "click .selected": "toggleOrderSelect"
    },
    template: _
        .template("<td><input type='checkbox' class='selected' selected/></td>"+
                  "<td><%= orderNumber %></td>"+
                  "<td><%= orderStatus %></td>"+
                  "<td><%= name %></td>"+
                  "<td>$<%= total.toFixed(2) %></td>"),
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
    render: function() {
        this.$el.html(this.template(this.model.attributes));
    },
    toggleOrderSelect : function(e) {
        this.model.attributes["selected"] = e.target.checked;
    }
});

//View to manage the table, really just a collection of views & holder for the above Collection
var OrdersGridView = Backbone.View.extend({
    tagName: "tbody",
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
    render: function() {
        var self = this;
        self.$el.empty();
        _.each(this.model.models, function(order){
            var lineView = new OrderLineItemView({model: order});
            lineView.render();
            self.$el.append(lineView.el);
        });
    }
});

//View holding the update button & showing total
var OrderSummaryControlView = Backbone.View.extend({
    tagName: "div",
    events: 
    {
        "click button": "reprocess"
    },
    template: _
        .template('<button type="button">Reprocess Selected</button>'+
                    '<dl>'+
                        '<dt>Total Unprocessed</dt>'+
                        '<dd>$<%= total%></dd>'+
                    '</dl>'),
    initialize: function() {
        this.listenTo(this.model, "change", this.render);
    },
    render: function() {
        this.$el.html(this.template({total: this.getTotalUnprocessed()}));
    },
    getTotalUnprocessed: function() {
        var sum = _.reduce(this.model.models, function(total, order){ 
            if(order.attributes["orderStatus"] == -1)
            {
                return total + order.attributes["total"];
            } else {
                return total;
            }
        }, 0);
        return sum.toFixed(2);
    },
    reprocess: function() {
        this.model.processSelections(0);
    }
});

//globals
var mainView, controlView;
var orders = new OrderList();

//bootstrap up the application
orders.fetch({
    success: function() {
        mainView = new OrdersGridView({model: orders});
        mainView.render();
        $('#order-detail').append(mainView.el);

        controlView = new OrderSummaryControlView({model: orders, detailView: mainView});
        controlView.render();
        $('.controls').append(controlView.el);
    }
});

/**
order = orders.models[0]
order.set({orderStatus: 0})
*/


